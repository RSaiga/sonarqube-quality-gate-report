import {IncomingWebhook} from "@slack/webhook";
import * as core from '@actions/core';
import axios from "axios";

export const run = async () => {
  const sonar = core.getInput('sonar');
  const projectKey = core.getInput('projectKey');
  const token = core.getInput('token');
  const onNewCode = core.getInput('onNewCode');
  const webhookUrl = core.getInput('webhook');
  const memberId = core.getInput('memberId');
  const getCognitiveComplexity = async () => {
    const response = await axios.get(
      `${sonar}/api/measures/component?component=${projectKey}&metricKeys=cognitive_complexity`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    return response.data.component.measures[0].value;
  };
  const getCoverage = async () => {
    const response = await axios.get(
      `${sonar}/api/measures/component?component=${projectKey}&metricKeys=coverage`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    return response.data.component.measures[0].value;
  };
  const getCoverage4NewCode = async () => {
    const response = await axios.get(
      `${sonar}/api/measures/component?component=${projectKey}&metricKeys=new_coverage`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    return response.data.component.measures[0].period.value;
  };
  const getCodeSmells = async () => {
    const response = await axios.get(
      `${sonar}/api/measures/component?component=${projectKey}&metricKeys=code_smells`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    return response.data.component.measures[0].value;
  };
  const getCodeSmells4NewCode = async () => {
    const response = await axios.get(
      `${sonar}/api/measures/component?component=${projectKey}&metricKeys=new_code_smells`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    return response.data.component.measures[0].period.value;
  };
  const getSeverity = async () => {
    const response = await axios.get(
      `${sonar}/api/issues/search?componentKeys=${projectKey}&facets=severities&resolved=false&s=SEVERITY&ps=1`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    const values = response.data.facets[0].values;
    let message = ''
    for (const value of values) {
      message += `${value.val}: ${value.count}\n`
    }
    return message;
  };

  const slack = async (text: string) => {
    const webhook = new IncomingWebhook(webhookUrl);
    await webhook.send({text});
  }

  let message = ''

  const severity = await getSeverity();
  message += `Severity: \n${severity}\n`

  const cognitiveComplexity = await getCognitiveComplexity()
  message += `cognitive_complexity: ${cognitiveComplexity}\n`
  if (onNewCode === 'off') {
    const coverage = await getCoverage();
    message += `coverage: ${coverage} %\n`
    const codeSmells = await getCodeSmells();
    message += `code_smells: ${codeSmells}\n`
  } else {
    const coverage4NewCode = await getCoverage4NewCode();
    message += `coverage_new_code: ${coverage4NewCode} %\n`
    const codeSmells4NewCode = await getCodeSmells4NewCode();
    message += `code_smells_new_code: ${codeSmells4NewCode}\n`
  }

  await slack(`<@${memberId}>\n${message}`);
};

run()