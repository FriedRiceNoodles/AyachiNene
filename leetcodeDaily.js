import axios from "axios";

const query = `
  query questionOfToday {
    todayRecord {
      date
      userStatus
      question {
        questionId
        frontendQuestionId: questionFrontendId
        difficulty
        title
        titleCn: translatedTitle
        titleSlug
        paidOnly: isPaidOnly
        freqBar
        isFavor
        acRate
        status
        solutionNum
        hasVideoSolution
        topicTags {
          name
          nameTranslated: translatedName
          id
        }
        extra {
          topCompanyTags {
            imgUrl
            slug
            numSubscribed
          }
        }
      }
      lastSubmission {
        id
      }
    }
  }
`;

const leetcodeDaily = axios.post("https://leetcode.cn/graphql/", {
  query,
});

export default leetcodeDaily;
