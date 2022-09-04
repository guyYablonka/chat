# RocketChat Changelog

All notable changes to this project will be documented in this file.
add a new entity starting with \[added/removed/changed/fixed/improved]:

# Unreleased

### Customer related

### Developer related

-   Integrate unit testing #403 #433

-   Run prettier on .ts .jsx .tsx .json files #401

-   remove all unused authentication services #426 (1-4)

-   replace bcrypt package with bcryptjs #409

### Bug fixed

-   Fix notifications not working #427

-   removing RocketChat from the code where it is not OK #238

-   fixing duplicate key errors in Message&Room creation #339

-   Room with no unread messages will be marked as read when leaving #430

🚀🎉🚀🎉🚀🎉🚀🎉🚀🎉🚀🎉🚀🎉🚀🎉🚀🎉🚀🎉🚀🎉🚀🎉🚀🎉🚀🎉🚀🎉🚀🎉🚀

# Released 1.0.6

### Customer related

-   Add go to bottom of conversation button #382

-   Add pagination to room member list and fix the member list functionality #340 #383 #385

-   Add shared groups button #384

-   Add questions and answers page for common questions #356 #416 #419 #422

-   Fix order of messages action to noa request #400

### Developer related

-   make matomo callbacks events more readable #365

-   Add matomo new track events for message actions #342

-   finish missing fuselage declerations #310

-   Refactor RoomList components #320 #415

-   Fix Eslint config #332 #334 #357

-   Added Route to set phone number #323

-   Add logs for mobile SSO #352 #364

-   Add matomo track events for rooms actions and "what's new" button #349 #366

-   Add 'createdFrom' field to new users while creating them #361

-   Set SSO service's id as 'upn' instead of 'sub' #362

-   add android logs #51

-   Add matomo track events for questions answers page and it's button #389 #411

### Bug fixed

-   fix menu fuselage doesnt close in all the system #360

-   fix unread message animtation & jumping to 1st unread message from bar #404 #407 #414 #421 #424

-   fix deleting message in room crash if RoomInfo is open #376

-   show jump to recent messages bar after jumping to 1st unread message #370

-   fix conversations order (including jumping empty conversations) #329 #355

-   fix unread bar having wrong messages number #359

-   cant jump to message on DM rooms #324

-   fixing first line of sequential message to be markable and clickable by removing width css property #322

-   allows reacting in group names containing an apostrophe #337

-   fixing unable to send very long reply message #341

-   fixing room menu doesnt close #338

-   prevents drag and drop overlay for text input #335

-   fixing reply to emoji from mobile appears as text in web #346 #377

-   emoji box doesnt close on send message with enter #367

-   room avatar does not change at that moment #368

-   emoji from mobile appears as text in sidebar #375 #380

-   emoji from mobile appears as text in reply preview #378

-   messy text of unmuted user system message #386

-   my message stream listening to all rooms #387

-   fixing render page when room avatar change and upload avatar to AmazonS3 #388

🚀🎉🚀🎉🚀🎉🚀🎉🚀🎉🚀🎉🚀🎉🚀🎉🚀🎉🚀🎉🚀🎉🚀🎉🚀🎉🚀🎉🚀🎉🚀🎉🚀

# Released 1.0.5

### Customer related

-   fixing reply in dm to be according to the characterization #279

### Developer related

-   remove all password functionality of channel from our code #286 #309

-   Developers can now inject custom elemnts into the DOM, intended for injecting liveChat-Widget #257

-   Added handshake error log - for more details when user tries to authenticate with sso #280

-   remove unexist settings which cause to reply with emojies to disappear. #306

### Bug fixed

-   fix file upload bar not showing #314

-   fix emoji picker not closing on reaction #313

-   fix scroll to quote on click #307

-   open direct room throws error of duplicate key in server side #304 #317

-   Emoji popup not aligned, shows spannables in message box #271 #296

-   fixing mute message in a group msg #245

-   files list responsive #264

-   set the sidebar no conversations message visible on gtoup by type mode #266

-   on room change in admin pannel show only what really change in sysmess #282

-   make room members list reder more efficiently with proper size to each member #292

-   Refactor User autocomplete & fix no results text #283

-   bug fix tooltip of close icon in blaze modal #272

-   fixing mute message in a group msg #245

-   removing profile picture title from edit user #275

-   join button should not be on messageBox #273

-   center modal of leave group and delete group #270 #294

-   fix create group popup translations #263

-   former owner still marked as owner after removing and re-adding them to room #289 #299

-   message author shows in read by screen #290 #298

-   block sending files in room you are not subscribe to #274

-   Mark room as read does not always work #291 #297 #344

-   search input for users in admin panel is too small #277

-   fix sys messages display in room msg search #293

-   make copy image button for image messages and make the copy button just for normal messages in the message three dots #191

-   removing cancelation button of file upload #258

-   quoted message links do not work after changing room name or type #261

-   Can't close modal after click again on the button #295

-   fixing user join and user left translation to include the room type #267

-   reduce the size of the input fields in edit room #276

-   mobile sending messges in loop #283

-   limiting the description input in the file upload modal to the Message_MaxAllowedSize setting #195

-   fixing the maxDescriptionLength to be undefined #308

-   fixing mentions logic #240

🚀🎉🚀🎉🚀🎉🚀🎉🚀🎉🚀🎉🚀🎉🚀🎉🚀🎉🚀🎉🚀🎉🚀🎉🚀🎉🚀🎉🚀🎉🚀🎉🚀

# Released 1.0.4

### Customer related

-   customer can paste excel data as image instead of plain text #247

-   fix sidebar item border bottom #268

-   removed RoomForeword in the direct room beggining #265

### Developer related

-   integration to matomo configured #253

-   Developers can now inject custom elemnts into the DOM, intended for injecting liveChat-Widget #257

### Bug fixed

-   fixing mute message in a group msg #245

-   files list responsive #264

-   set the sidebar no conversations message visible on gtoup by type mode #266

-   regex limitation on room topic and annoumcement #243

-   fixing 'user left' system message without username #237

-   clicking on quoted message does not scroll to message on direct rooms #244

-   clicking on quoted message scrolls from the very top of the room #244

-   contacts do not show in chat #246

-   fix SSO users get a prompt to change password #248

-   Making file downloads work after logging out from other clients #249

-   fix user sub to dm to be false when he just open the room #220

-   starred message list not updated properly on removal #256

-   fixing mute message in a group msg #245

-   files list responsive #264

-   set the sidebar no conversations message visible on gtoup by type mode #266

🚀🎉🚀🎉🚀🎉🚀🎉🚀🎉🚀🎉🚀🎉🚀🎉🚀🎉🚀🎉🚀🎉🚀🎉🚀🎉🚀🎉🚀🎉🚀🎉🚀

# Released 1.0.3

### Customer related 👨‍💻

-   add option for users to go to tutorial for cargo in cargo modal #193

-   make whats new button as like other text font #188

-   show 2 matcali numbers and not kapat number #184

-   return the chat-logo asset on home page #179 #215

-   make message show last slash and not the whole name #152

-   show description of file after the file #130

-   add translation to channel system message and use name and not username #137

-   show name on quote and not username #135

-   show modal to user when adding file above 30mb #88

-   add star icon when star message #85

-   prevent messages from overlay the messsage box #85

-   add nice ui for chat screen #69

-   revamp conversations list in sidebar #66

-   imporve room info screen #65

-   remodel entire user info screen #55

-   show name when adding user to group #52

-   integrate to s3 #33

-   let user leaves room when last #11

-   allow admins view private conversations #12

-   search message in room by part of the word #9

-   show empty blue dot when room is marked as unread #10

-   add what's new button and new page implementation #24

-   add time and date for all rooms in sidebar #15

-   feat enable users to mute room by preference #14

-   make what's new page jump after version update #27

-   feat enable users to pin room by preference #19

-   add route to commuunicate with mobile app #4

-   remove the option of avatars from gravatar #31

-   change the default for send welcome mail and random password and join default channels to false and remove from ui #32

-   improve the unsupported browser page #40

-   change the UI of the profile page to be like 0.7 #38

-   add informative landing page #50

-   add blue ticks to the message read receipt #57

-   change account menu and preferences #47

-   feat add developers page #60

-   integrate mobile auth from 0.7 #53

-   separate auth url values between the sites #58

-   change the group by time or activity #64

-   update ui of user menu + add dark mode #64 #94

-   update message box UI #72

-   allow choosing new owner on removing last owner from room #78

-   fixing logic for mark as read #80

-   improve user search performance #76

-   add validation for file names #77

-   customize login page #79

-   remove toggles of room type and hiding system messages from room edition #120

-   disable conversion of long messages to text files #144

-   fix the server to work with all the proxy inbound requests #93

-   add no conversations message on side bar #163

-   fixing too many request on side bar and show displayname by priority #169

-   implement subscription.getByRoom route #209 #216

-   extract message removal to external writer #211

-   extract marking room as read to external writer #211

-   removing the app store link from the unsuppoted browser page #233

-   create action origin and implement it on new messages #255

### Developer related 👩‍💻

-   change notifications logs as settings #197 #203

-   add routes that the proxy uses to perform actions as another user #3

-   add all destinations funcionality to be able to extract events to external service #1

-   add sending the relevant data to the KWS on every action in a room that has external users #5

-   add message limit as setting #8

-   perform prettier on all project files #22

-   add firstName & lastName customFields to search #18

-   fix go to searched msg by one click #17

-   clear destinations on self-targeted message #30

-   add user agents to users custom fields #34

-   pull from rocketchat tag 3.11.4 #41

-   fix db migration scripts #42

-   refactor server side logs to have more info #43

-   limit login tokens with a setting for this #54

-   setting verified filed to be true and removing verified toggle and sending emails to users #45

-   control background color through setting #75

-   fix settings.public route for mobile #86

-   add feature toggle for room Archive #90

-   add interface with users service #84 #121 #158

-   change default value of registration enabling to public #101

-   Excluding specific methods to be used always over websocket #164

-   add new migration - add fullname to all users #167

-   adding new data to logs and fixing some problems #171

-   optimize logger performance #219

### Bug fixed 🐛

-   return findOneByUsernameOrEmail and findOneByUsernamesOrEmails to regex query #230

-   fix read receipt update on messages #187

-   fix bots react to messages by change **my_messages** stream #174

-   change back main content width so starred&search messages won't get off the screen #155

-   add debounce to userAutoCompleteMultiple to show relevant data #153

-   add content type to file so mobile can use route #149

-   show only one tooltip and not double #117 # 189

-   system messages show display name and not username #107

-   name wo'nt display on chrome 70 #106

-   API rooms could receive deleted rooms #91

-   new day on system messages is overlay messages + system messages margin unnecessary #105

-   messages won't overlay message box + message reply move under reply box #97

-   on group member list, the option of member did not render #95

-   user who don't have firstname and lastname return undefine in the dropdown #87

-   fixing popovers in sidebar not showing properly when language is in RTL format #13

-   fix side bar ui #16

-   fixing scroll in pages on chrome version 70 #20

-   let spaces and Hebrew in room name #21

-   fixing error when admin watch private group friends list #37

-   fix app not working due to logger & api errors #63

-   fix Mobile compatibility #71

-   fix error of findRoomByIdOrName #74

-   fix displayName not showing properly in user auto complete & file list overflow #89

-   fix logger not being consistent #83

-   fixing input overriding selected items & addon not working properly #92

-   pull auth url from env in both client & server #96

-   fix room name limit and disable save on empty room name #98

-   fix message search not finding attachments #99

-   starred messages arent displayed with their dates #108

-   Problems with search - split() error, styling in chrome 70 #111

-   fixing room not found error when changing room name #102

-   replies to generic file messages are displayed as normal messages #110

-   members list names were not multi line #109

-   fix avatar section in edit room #104

-   making the icon in the contact side bar bigger #113

-   leave room when you leave it does not go back to home screen #119

-   unread messages label still appears after reopening room #112

-   unable to send messages after being unmuted #122

-   show incorrect sentence to user when the account delete by admin #123

-   search users display incorrectly #125

-   favorite messages appear in the wrong order #115

-   system message of set owner is turned over #128

-   migration for self direct rooms #139

-   fix wrong use of UTF8 regexs #133

-   Router goes to homepage when renaming room #136

-   Mobile cant get all setting #138

-   fix warning of event emitter limit exceeded #134

-   fix can't edit room from admin panel #146

-   fix logger not working in production #145

-   migration to remove the sysmes filed from room #147

-   mobile exception to get messages #151

-   show the last slash of name of local rooms in search #154

-   show unread messages for all messages #157

-   add user to room throw user doesnt exist error #127

-   fix toast error when marking room as unread #166

-   fix could not press send icon of message box to send a message #165

-   clicking on enter in invite members text box adds random users to list #170

-   logout all other devices also logs out the caller client #172

-   validating the file name on the client before uploading #116 #178

-   fixing the search in mobile devices & session scoped checkbox #173

-   deleted starred messages are still marked as starred #177

-   fixing rooms not being removed properly in mobile devices #175

-   fixing mobile not receiving last message #176

-   fixing errors on mobile when searching your room with yourself #168

-   last login shows never to non admin users #180

-   link to quoted message does not work properly #181

-   fixing file without extension to download with his extension #142

-   fixing burger menu not showing when sidebar hidden on width resolution 600 - 780 #182

-   pdf without description showes null in mobile #185

-   fixing mobile authentication not parsing redirect uri successfully #192

-   user mentions isnt working well #183

-   fixing mobile auth cannot add role #198

-   handle undefined user in migration v220 #199

-   fix users serivce integration #201

-   handle Meteor.userId() return undefined in updateLastWhatsNewVersion #202

-   Excedded memory limit for $group. #200

-   Fix Migration 220 wait while migrated #206

-   Adding allow disc write to migration #205

-   Cannot read property "\_id" of undefined in mirgration v217 #204

-   mobile auth not returning correct response #207

-   username undefined make all subscription collection update #208

-   msg out of sync from proxy #212

-   fix mobile auth disconnecting user on auth #213

-   mobile missing expiersIn param #217

-   fix memory leak due to stream cast usage #218

-   some inbound routes re-sync the actions without considering extraData #221

-   fix aman role error to be with username or email #222

-   improving search usernames and emails by text index to avoid incasensetive #224

-   fix hamal inbound not working & fix error message from validate external #226

-   fix inbound group actions with users that don't exist does not recreate user #231

-   fix logs looking ugly in splunk #227

-   sync actions by external proxies deny causing loops #229

-   some requests to external writer fail due to loads #232

-   axios throws too large error that causes crash #235

-   typing on mobile does not notify other users #234

-   setting email to default idfts.il and finding user by username only #236

-   Scrolling in files list makes files invisible & no files text not centered #239

-   mobile cant show room list #241

-   react whan read only value always showing false #250

-   kubernetes deployment crashes in rockettar #311

-   add from field to new messages from mobile and proxy #327

-   fix send message if room description/announcement/topic change #358

## Released

previous changelog:
https://github.com/RocketChat/Rocket.Chat/blob/develop/HISTORY.md

# 3.11.4

`2021-02-10 · 5 🐛 · 6 👩‍💻👨‍💻`
