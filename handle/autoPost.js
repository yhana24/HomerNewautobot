const cron = require("node-cron");
const axios = require("axios");
function getGUID() {
  var sectionLength = Date.now();
  var id = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    function (c) {
      var r = Math.floor((sectionLength + Math.random() * 16) % 16);
      sectionLength = Math.floor(sectionLength / 16);
      var _guid = (c == "x" ? r : (r & 7) | 8).toString(16);
      return _guid;
    },
  );
  return id;
}
async function autoPost(api) {
  if (global.NashBoT.AUTOPOST == true) {
    cron.schedule(
      "0 */5 * * *", // every 5 hours
      async function () {
        const u = "https://catfact.ninja/fact";
        const cat = (await axios.get(u)).data;
        const fact = cat.fact;
        const bot = api.getCurrentUserID();
        let uuid = getGUID();
        const formData = {
          input: {
            composer_entry_point: "inline_composer",
            composer_source_surface: "timeline",
            idempotence_token: uuid + "_FEED",
            source: "WWW",
            attachments: [],
            audience: {
              privacy: {
                allow: [],
                base_state: "EVERYONE", // SELF EVERYONE FRIENDS
                deny: [],
                tag_expansion_state: "UNSPECIFIED",
              },
            },
            message: {
              ranges: [],
              text: "𝚁𝙰𝙽𝙳𝙾𝙼 𝙲𝙰𝚃 𝙵𝙰𝙲𝚃: “" + fact + "”",
            },
            with_tags_ids: [],
            inline_activities: [],
            explicit_place_id: "0",
            text_format_preset_id: "0",
            logging: {
              composer_session_id: uuid,
            },
            tracking: [null],
            actor_id: bot,
            client_mutation_id: Math.floor(Math.random() * 17),
          },
          displayCommentsFeedbackContext: null,
          displayCommentsContextEnableComment: null,
          displayCommentsContextIsAdPreview: null,
          displayCommentsContextIsAggregatedShare: null,
          displayCommentsContextIsStorySet: null,
          feedLocation: "TIMELINE",
          feedbackSource: 0,
          focusCommentID: null,
          gridMediaWidth: 230,
          groupID: null,
          scale: 3,
          privacySelectorRenderLocation: "COMET_STREAM",
          renderLocation: "timeline",
          useDefaultActor: false,
          inviteShortLinkKey: null,
          isFeed: false,
          isFundraiser: false,
          isFunFactPost: false,
          isGroup: false,
          isTimeline: true,
          isSocialLearning: false,
          isPageNewsFeed: false,
          isProfileReviews: false,
          isWorkSharedDraft: false,
          UFI2CommentsProvider_commentsKey: "ProfileCometTimelineRoute",
          hashtag: null,
          canUserManageOffers: false,
        }; // end of form data
        const form = {
          av: bot,
          fb_api_req_friendly_name: "ComposerStoryCreateMutation",
          fb_api_caller_class: "RelayModern",
          doc_id: "7711610262190099",
          variables: JSON.stringify(formData),
        }; // end of form
        api.httpPost(
          "https://www.facebook.com/api/graphql/",
          form,
          (e, info) => {
            try {
              if (e) throw e;
              if (info.error) throw info.error;
              if (typeof info == "string")
                info = JSON.parse(info.replace("for (;;);", ""));
              const postID =
                info.data.story_create.story.legacy_story_hideable_id;
              if (!postID) throw info.errors;
              return console.log(
                "[AUTO POST]\nLink: https://www.facebook.com/" +
                  api.getCurrentUserID() +
                  "/posts/" +
                  postID,
              );
            } catch (e) {
              return console.error(e.message);
            }
          },
        );
      },
      {
        scheduled: true,
        timezone: "Asia/Manila",
      },
    );
  }
}
module["exports"] = autoPost;
