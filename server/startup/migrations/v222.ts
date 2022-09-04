import { Migrations } from '../../../app/migrations/server';
import { Rooms } from '/app/models/server/raw';

const fixRoomsLastMessageTimestamp = async () => {
    const cursor = Rooms.find({
        $and: [
            { oldRoomName: { $exists: false } },
            {
                $or: [
                    { lastMessage: null },
                    {
                        $and: [
                            { lastMessage: { $ne: null } },
                            { $where: 'this.lm > this.lastMessage.ts' }
                        ]
                    }
                ]
            }
        ]
    });

    const totalActions = await cursor.count();
    let finishedActions = 0;

    let actions = [];

    for await (const room of cursor) {
        const { _id, ts, lastMessage } = room;

        const update =
            lastMessage || room.t !== 'd'
                ? {
                      $set: { lm: lastMessage?.ts ?? ts }
                  }
                : {
                      $unset: { lm: 1 }
                  };

        actions.push({
            updateOne: {
                filter: { _id },
                update
            }
        });

        if (actions.length === 100) {
            await Rooms.col.bulkWrite(actions, { ordered: true });
            finishedActions += 100;
            console.info(
                `executed ${finishedActions} actions out of ${totalActions}`
            );
            actions = [];
        }
    }

    if (actions.length) {
        await Rooms.col.bulkWrite(actions, { ordered: true });
        finishedActions += actions.length;
        console.info(`finished executing ${finishedActions} actions`);
        actions = [];
    }
};

Migrations.add({
    version: 222,
    up() {
        Promise.await(fixRoomsLastMessageTimestamp());
    }
});
