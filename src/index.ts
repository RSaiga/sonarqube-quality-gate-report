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

  async function fetch(url: string) {
    return await axios.get(
      url,
      {
        headers: {
          'Authorization': `Bearer ${token}`
          // 'Authorization': 'Basic ' + Buffer.from('admin' + ':' + '19820101').toString('base64')
        }
      });
  }

  const getCognitiveComplexity = async () => {
    const url = `${sonar}/api/measures/component?component=${projectKey}&metricKeys=cognitive_complexity`;
    const response = await fetch(url);
    return response.data.component.measures[0].value;
  };
  const getCoverage = async () => {
    const url = `${sonar}/api/measures/component?component=${projectKey}&metricKeys=coverage`;
    const response = await fetch(url);
    return response.data.component.measures[0].value;
  };
  const getCoverage4NewCode = async () => {
    const url = `${sonar}/api/measures/component?component=${projectKey}&metricKeys=new_coverage`;
    const response = await fetch(url);
    return response.data.component.measures[0]?.period.value;
  };
  const getCodeSmells = async () => {
    const url = `${sonar}/api/measures/component?component=${projectKey}&metricKeys=code_smells`;
    const response = await fetch(url);
    return response.data.component.measures[0].value;
  };
  const getCodeSmells4NewCode = async () => {
    const url = `${sonar}/api/measures/component?component=${projectKey}&metricKeys=new_code_smells`;
    const response = await fetch(url);
    return response.data.component.measures[0]?.period.value;
  };
  const getSeverity = async (type: string) => {
    const url = `${sonar}/api/issues/search?componentKeys=${projectKey}&facets=severities&resolved=false&s=SEVERITY&ps=1&types=${type}`;
    const response = await fetch(url);
    return response.data.facets[0].values;
  };
  const getSecurityHotspots = async () => {
    const url = `${sonar}/api/measures/component?component=${projectKey}&metricKeys=security_hotspots`;
    const response = await fetch(url);
    return response.data.component.measures[0]?.value;
  };
  const getSecurityHotspots4NewCode = async () => {
    const url = `${sonar}/api/measures/component?component=${projectKey}&metricKeys=new_security_hotspots`;
    const response = await fetch(url);
    return response.data.component.measures[0]?.period.value;
  };
  const getDuplicatedLinesDensity = async () => {
    const url = `${sonar}/api/measures/component?component=${projectKey}&metricKeys=duplicated_lines_density`;
    const response = await fetch(url);
    return response.data.component.measures[0].value;
  };
  const getDuplicatedLinesDensity4NewCode = async () => {
    const url = `${sonar}/api/measures/component?component=${projectKey}&metricKeys=new_duplicated_lines_density`;
    const response = await fetch(url);
    return response.data.component.measures[0]?.period.value;
  };
  const getBugs = async () => {
    const url = `${sonar}/api/measures/component?component=${projectKey}&metricKeys=bugs`;
    const response = await fetch(url);
    return response.data.component.measures[0].value;
  };
  const getBugs4NewCode = async () => {
    const url = `${sonar}/api/measures/component?component=${projectKey}&metricKeys=new_bugs`;
    const response = await fetch(url);
    return response.data.component.measures[0]?.period.value;
  };
  const getVulnerabilities = async () => {
    const url = `${sonar}/api/measures/component?component=${projectKey}&metricKeys=vulnerabilities`;
    const response = await fetch(url);
    return response.data.component.measures[0].value;
  };
  const getVulnerabilities4NewCode = async () => {
    const url = `${sonar}/api/measures/component?component=${projectKey}&metricKeys=new_vulnerabilities`;
    const response = await fetch(url);
    return response.data.component.measures[0]?.period.value;
  };

  const getMetricKey = async () => {
    const url = `${sonar}/api/qualitygates/project_status?projectKey=${projectKey}`;
    const response = await fetch(url);
    return response.data.projectStatus;
  };

  const getCognitiveComplexities = async () => {
    const url = `${sonar}/api/measures/component_tree?component=${projectKey}&strategy=leaves&metricKeys=cognitive_complexity&s=metric&metricSort=cognitive_complexity&asc=false&ps=500`;
    const response = await fetch(url);
    console.log(JSON.stringify(response.data))
  };

  const slack = async (template: any) => {
    const webhook = new IncomingWebhook(webhookUrl);
    await webhook.send(template);
  }

  const severityBugs = await getSeverity("BUG");
  const severityVulnerabilities = await getSeverity("VULNERABILITY");
  const severityCodeSmells = await getSeverity("CODE_SMELL");
  let coverage: number
  let codeSmells: number
  let securityHotspots: number
  let duplicatedLinesDensity: number
  let bugs: number;
  let vulnerabilities: number;
  if (onNewCode === 'off') {
    coverage = await getCoverage();
    codeSmells = await getCodeSmells();
    securityHotspots = await getSecurityHotspots();
    duplicatedLinesDensity = await getDuplicatedLinesDensity();
    bugs = await getBugs();
    vulnerabilities = await getVulnerabilities();

  } else {
    coverage = await getCoverage4NewCode();
    codeSmells = await getCodeSmells4NewCode();
    securityHotspots = await getSecurityHotspots4NewCode();
    duplicatedLinesDensity = await getDuplicatedLinesDensity4NewCode();
    bugs = await getBugs4NewCode();
    vulnerabilities = await getVulnerabilities4NewCode();
  }
  const cognitiveComplexity = await getCognitiveComplexity()
  const projectStatus = await getMetricKey()
  const getSeverityCount = (severity: any, type: string) => severity.find((element: any) => element.val === type).count;
  await getCognitiveComplexities()


  const mention = (memberId !== "") ? `<@${memberId}>\n\n` : ``;

  const getProjectStatus = () => {
    const status = ([{
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": `Quality Gate Status : *${projectStatus.status === "OK" ? "Passed" : "Failed"}* ${projectStatus.status === "OK" ? ":white_check_mark:" : ":fire:"}`
      },
    }]);
    const errorConditions = getProjectStatusErrorConditions()
    return status.concat(errorConditions)
  };
  const getProjectStatusErrorConditions = () => {
    return projectStatus.conditions
      .filter((element: any) => element.status === "ERROR")
      .map((v: any) =>
        (
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": `*${v.metricKey.toUpperCase()}*  actual: \`${v.actualValue}\`  threshold: \`${v.errorThreshold}\``
            }
          }))
  };

  const template = {
    "text": `${mention}*Notification from sonarqube, please fix!*\n${sonar}/dashboard?id=${projectKey}`,
    "attachments": [
      {
        "color": projectStatus.status === "OK" ? "#35ef0a" : "#ef0a3f",
        "blocks": getProjectStatus()
      },
      {
        "color": "#faf9f8",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": `*Bugs* : *${bugs}*`
            }
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": `Blocker : \`${getSeverityCount(severityBugs, 'BLOCKER')}\`  Critical : \`${getSeverityCount(severityBugs, 'CRITICAL')}\` `
            }
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": `Major : \`${getSeverityCount(severityBugs, 'MAJOR')}\`  Minor : \`${getSeverityCount(severityBugs, 'MINOR')}\`  Info : \`${getSeverityCount(severityBugs, 'INFO')}\``
            }
          }
        ]
      },
      {
        "color": "#faf9f8",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": `*Vulnerabilities* : *${vulnerabilities}*`
            }
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": `Blocker : \`${getSeverityCount(severityVulnerabilities, 'BLOCKER')}\`  Critical : \`${getSeverityCount(severityVulnerabilities, 'CRITICAL')}\``
            }
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": `Major : \`${getSeverityCount(severityVulnerabilities, 'MAJOR')}\`  Minor : \`${getSeverityCount(severityVulnerabilities, 'MINOR')}\`  Info : \`${getSeverityCount(severityVulnerabilities, 'INFO')}\``
            }
          }
        ]
      },
      {
        "color": "#faf9f8",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": `*Code Smells* : *${codeSmells}*`
            }
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": `Blocker : \`${getSeverityCount(severityCodeSmells, 'BLOCKER')}\`  Critical : \`${getSeverityCount(severityCodeSmells, 'CRITICAL')}\``
            }
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": `Major : \`${getSeverityCount(severityCodeSmells, 'MAJOR')}\`  Minor : \`${getSeverityCount(severityCodeSmells, 'MINOR')}\`  Info : \`${getSeverityCount(severityCodeSmells, 'INFO')}\``
            }
          }
        ]
      },
      {
        "color": "#faf9f8",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": `*Security Hotspots* : *${securityHotspots}*`
            }
          },
        ]
      },
      {
        "color": "#faf9f8",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": `*Coverage* : *${coverage} %*`
            }
          },
        ]
      },
      {
        "color": "#faf9f8",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": `*Duplicated Lines* : *${duplicatedLinesDensity} %*`
            }
          },
        ]
      },
      {
        "color": "#faf9f8",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": `*Cognitive Complexity* : *${cognitiveComplexity}*`
            }
          }
        ]
      }
    ]
  }
  // await slack(template)
};

run()