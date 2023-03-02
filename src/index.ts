import {IncomingWebhook} from "@slack/webhook";
import * as core from '@actions/core';
import axios from "axios";
import 'dotenv/config'

export const run = async () => {
  const sonar = process.env.SONAR ?? core.getInput('sonar')
  const projectKey = process.env.PROJECT_KEY ?? core.getInput('projectKey');
  const token = process.env.PROJECT_KEY ?? core.getInput('token');
  const onNewCode = process.env.ON_NEW_CODE ?? core.getInput('onNewCode');
  const webhookUrl = process.env.WEBHOOK ?? core.getInput('webhook');
  const memberId = process.env.MEMBER_ID ?? core.getInput('memberId');
  const getCognitiveComplexity = async () => {
    const response = await axios.get(
      `${sonar}/api/measures/component?component=${projectKey}&metricKeys=cognitive_complexity`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
          // 'Authorization': 'Basic ' + Buffer.from('admin' + ':' + '19820101').toString('base64')
        }
      });
    console.log(response)
    return response.data.component.measures[0].value;
  };
  const getCoverage = async () => {
    const response = await axios.get(
      `${sonar}/api/measures/component?component=${projectKey}&metricKeys=coverage`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
          // 'Authorization': 'Basic ' + Buffer.from('admin' + ':' + '19820101').toString('base64')
        }
      });
    console.log(response)
    return response.data.component.measures[0].value;
  };
  const getCoverage4NewCode = async () => {
    const response = await axios.get(
      `${sonar}/api/measures/component?component=${projectKey}&metricKeys=new_coverage`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
          // 'Authorization': 'Basic ' + Buffer.from('admin' + ':' + '19820101').toString('base64')
        }
      });
    console.log(response)
    return response.data.component.measures[0]?.period.value;
  };
  const getCodeSmells = async () => {
    const response = await axios.get(
      `${sonar}/api/measures/component?component=${projectKey}&metricKeys=code_smells`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
          // 'Authorization': 'Basic ' + Buffer.from('admin' + ':' + '19820101').toString('base64')
        }
      });
    console.log(response)
    return response.data.component.measures[0].value;
  };
  const getCodeSmells4NewCode = async () => {
    const response = await axios.get(
      `${sonar}/api/measures/component?component=${projectKey}&metricKeys=new_code_smells`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
          // 'Authorization': 'Basic ' + Buffer.from('admin' + ':' + '19820101').toString('base64')
        }
      });
    console.log(response)
    return response.data.component.measures[0]?.period.value;
  };
  const getSeverity = async () => {
    const response = await axios.get(
      `${sonar}/api/issues/search?componentKeys=${projectKey}&facets=severities&resolved=false&s=SEVERITY&ps=1`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
          // 'Authorization': 'Basic ' + Buffer.from('admin' + ':' + '19820101').toString('base64')
        }
      });
    console.log(response)
    return response.data.facets[0].values;
  };

  const slack = async (template: any) => {
    const webhook = new IncomingWebhook(webhookUrl);
    await webhook.send(template);
  }

  const severity = await getSeverity();
  let coverage: number
  let codeSmells: number
  if (onNewCode === 'off') {
    coverage = await getCoverage();
    codeSmells = await getCodeSmells();
  } else {
    coverage = await getCoverage4NewCode();
    codeSmells = await getCodeSmells4NewCode();
  }
  const cognitiveComplexity = await getCognitiveComplexity()

  const getSeverityCount = (type: string) => severity.find((element: any) => element.val === type).count;
  const getSeverityEmoji = (type: string, threshold: number) => getSeverityCount(type) <= threshold ? ":white_check_mark:" : ":fire:";
  const getGreaterThanThresholdEmoji = (coverage: number, threshold: number) => coverage >= threshold ? ":white_check_mark:" : ":fire:";
  const getLessThanThresholdEmoji = (coverage: number, threshold: number) => coverage <= threshold ? ":white_check_mark:" : ":fire:";

  const mention = (memberId !== "") ? `<@${memberId}>\n\n` : ``;
  const template = {
    "text": `${mention}*Notification from sonarqube, please fix!*\n${sonar}/dashboard?id=${projectKey}`,
    "attachments": [
      {
        "color": "#35ef0a",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": `*BLOCKER* : *${getSeverityCount('BLOCKER')}* ${getSeverityEmoji('BLOCKER', 0)}  *CRITICAL* : *${getSeverityCount('CRITICAL')}* ${getSeverityEmoji('CRITICAL', 0)}`
            }
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": `*MAJOR* : *${getSeverityCount('MAJOR')}* ${getSeverityEmoji('MAJOR', 0)}  *MINOR* : *${getSeverityCount('MINOR')}* ${getSeverityEmoji('MINOR', 0)}  *INFO* : *${getSeverityCount('INFO')}* ${getSeverityEmoji('INFO', 0)}`
            }
          },
          {
            "type": "divider"
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": `*Coverage* : *${coverage} %* ${getGreaterThanThresholdEmoji(coverage, 80)}`
            }
          },
          {
            "type": "divider"
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": `*Code Smells* : *${codeSmells}* ${getLessThanThresholdEmoji(codeSmells, 10)}`
            }
          },
          {
            "type": "divider"
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": `*Cognitive Complexity* : *${cognitiveComplexity}* ${getLessThanThresholdEmoji(cognitiveComplexity, 30)}`
            }
          }
        ]
      }
    ]
  }

  await slack(template)
};

run()