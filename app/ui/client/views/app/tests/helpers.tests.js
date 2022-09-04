import { timeAgo } from '../helpers';

describe('Helpers', () => {
	describe('timeAgo', () => {
		it('returns formated time when the passed value is on the same day', () => {
			const now = new Date('Mon Aug 06 2018 22:00:00');

			const t1 = new Date('Mon Aug 06 2018 01:00:00');
			const t2 = new Date('Mon Aug 06 2018 10:00:10');
			const t3 = new Date('Mon Aug 06 2018 14:30:10');

			const func = a => a;

			expect(timeAgo(t1, func, now)).toEqual('1:00 AM');
			expect(timeAgo(t2, func, now)).toEqual('10:00 AM');
			expect(timeAgo(t3, func, now)).toEqual('2:30 PM');
		});

		it('returns "yesterday" when the passed value is on the day before', () => {
			const now = new Date('Tue Jul 03 2018 23:00:00');

			const t1 = new Date('Tue Jul 02 2018 23:59:00');
			const t2 = new Date('Tue Jul 02 2018 22:30:00');
			const t3 = new Date('Tue Jul 02 2018 01:00:00');

			const func = a => a;

			expect(timeAgo(t1, func, now)).toEqual('yesterday');
			expect(timeAgo(t2, func, now)).toEqual('yesterday');
			expect(timeAgo(t3, func, now)).toEqual('yesterday');
		});

		it('returns formated date when the passed value two or more days before', () => {
			const now = new Date('Wed Jun 20 2018 00:00:01');

			const t1 = new Date('Mon Jun 18 2018 10:00:00');
			const t2 = new Date('Sun Jun 10 2018 00:00:00');
			const t3 = new Date('Thu May 10 2018 00:00:00');
			const t4 = new Date('Sun May 20 2018 00:00:01');
			const t5 = new Date('Fri Nov 10 2017 00:00:00');

			const func = () => 'should not be called';

			expect(timeAgo(t1, func, now)).toEqual('Jun 18, 2018');
			expect(timeAgo(t2, func, now)).toEqual('Jun 10, 2018');
			expect(timeAgo(t3, func, now)).toEqual('May 10, 2018');
			expect(timeAgo(t4, func, now)).toEqual('May 20, 2018');
			expect(timeAgo(t5, func, now)).toEqual('Nov 10, 2017');
		});
	});
});
