import {IncomingWebhook} from "@slack/webhook";
import * as core from '@actions/core';
import axios from "axios";

export const run = async () => {
  const sonar = core.getInput('sonar');
  const projectKey = core.getInput('projectKey');
  const token = core.getInput('token');
  // const username = core.getInput('username');
  // const password = core.getInput('password');
  const onNewCode = core.getInput('onNewCode');
  const webhookUrl = core.getInput('webhook');
  const mention = core.getInput('mention');
  core.info(sonar);
  core.info(projectKey);
  core.info(token);
  // core.debug(username);
  // core.debug(password);
  core.info(onNewCode);
  core.info(webhookUrl);
  core.info(mention);
  const getCognitiveComplexity = async () => {
    // const response = await fetch(
    //   // 'http://localhost:8084/api/measures/component?component=kings_python&metricKeys=cognitive_complexity',
    //   `${sonar}/api/measures/component?component=${projectKey}&metricKeys=cognitive_complexity`,
    //   {
    //     headers: {
    //       // 'Authorization': 'Basic ' + new Buffer('admin' + ':' + '19820101').toString('base64')
    //       'Authorization': 'Basic ' + new Buffer(`${username}:${password}`).toString('base64')
    //     }
    //   });
    // const res = await response.json();
    const response = await axios.get(
      // 'http://localhost:8084/api/measures/component?component=kings_python&metricKeys=cognitive_complexity',
      `${sonar}/api/measures/component?component=${projectKey}&metricKeys=cognitive_complexity`,
      {
        headers: {
          // 'Authorization': 'Basic ' + new Buffer('admin' + ':' + '19820101').toString('base64')
          'Authorization': `Bearer ${token}`
        }
      });
    return response.data.component.measures[0].value;
  };
  const getCoverage = async () => {
    // const response = await fetch(
    //   // 'http://localhost:8084/api/measures/component?component=kings_python&metricKeys=coverage',
    //   `${sonar}/api/measures/component?component=${projectKey}&metricKeys=coverage`,
    //   {
    //     headers: {
    //       // 'Authorization': 'Basic ' + new Buffer('admin' + ':' + '19820101').toString('base64')
    //       'Authorization': 'Basic ' + new Buffer(`${username}:${password}`).toString('base64')
    //     }
    //   });
    // const res = await response.json();
    const response = await axios.get(
      // 'http://localhost:8084/api/measures/component?component=kings_python&metricKeys=coverage',
      `${sonar}/api/measures/component?component=${projectKey}&metricKeys=coverage`,
      {
        headers: {
          // 'Authorization': 'Basic ' + new Buffer('admin' + ':' + '19820101').toString('base64')
          // 'Authorization': 'Basic ' + new Buffer(`${username}:${password}`).toString('base64')
          'Authorization': `Bearer ${token}`
        }
      });
    return response.data.component.measures[0].value;
  };
  const getCoverage4NewCode = async () => {
    // const response = await fetch(
    //   // 'http://localhost:8084/api/measures/component?component=kings_python&metricKeys=new_coverage',
    //   `${sonar}/api/measures/component?component=${projectKey}&metricKeys=new_coverage`,
    //   {
    //     headers: {
    //       // 'Authorization': 'Basic ' + new Buffer('admin' + ':' + '19820101').toString('base64')
    //       'Authorization': 'Basic ' + new Buffer(`${username}:${password}`).toString('base64')
    //     }
    //   });
    // const res = await response.json();
    const response = await axios.get(
      // 'http://localhost:8084/api/measures/component?component=kings_python&metricKeys=new_coverage',
      `${sonar}/api/measures/component?component=${projectKey}&metricKeys=new_coverage`,
      {
        headers: {
          // 'Authorization': 'Basic ' + new Buffer('admin' + ':' + '19820101').toString('base64')
          // 'Authorization': 'Basic ' + new Buffer(`${username}:${password}`).toString('base64')
          'Authorization': `Bearer ${token}`
        }
      });
    return response.data.component.measures[0].period.value;
  };
  const getCodeSmells = async () => {
    // const response = await fetch(
    //   // 'http://localhost:8084/api/measures/component?component=kings_python&metricKeys=code_smells',
    //   `${sonar}/api/measures/component?component=${projectKey}&metricKeys=code_smells`,
    //   {
    //     headers: {
    //       // 'Authorization': 'Basic ' + new Buffer('admin' + ':' + '19820101').toString('base64')
    //       'Authorization': 'Basic ' + new Buffer(`${username}:${password}`).toString('base64')
    //     }
    //   });
    // const res = await response.json();
    const response = await axios.get(
      // 'http://localhost:8084/api/measures/component?component=kings_python&metricKeys=code_smells',
      `${sonar}/api/measures/component?component=${projectKey}&metricKeys=code_smells`,
      {
        headers: {
          // 'Authorization': 'Basic ' + new Buffer('admin' + ':' + '19820101').toString('base64')
          // 'Authorization': 'Basic ' + new Buffer(`${username}:${password}`).toString('base64')
          'Authorization': `Bearer ${token}`
        }
      });
    return response.data.component.measures[0].value;
  };
  const getCodeSmells4NewCode = async () => {
    // const response = await fetch(
    //   // 'http://localhost:8084/api/measures/component?component=kings_python&metricKeys=new_code_smells',
    //   `${sonar}/api/measures/component?component=${projectKey}&metricKeys=new_code_smells`,
    //   {
    //     headers: {
    //       // 'Authorization': 'Basic ' + new Buffer('admin' + ':' + '19820101').toString('base64')
    //       'Authorization': 'Basic ' + new Buffer(`${username}:${password}`).toString('base64')
    //     }
    //   });
    // const res = await response.json();
    const response = await axios.get(
      // 'http://localhost:8084/api/measures/component?component=kings_python&metricKeys=new_code_smells',
      `${sonar}/api/measures/component?component=${projectKey}&metricKeys=new_code_smells`,
      {
        headers: {
          // 'Authorization': 'Basic ' + new Buffer('admin' + ':' + '19820101').toString('base64')
          // 'Authorization': 'Basic ' + new Buffer(`${username}:${password}`).toString('base64')
          'Authorization': `Bearer ${token}`
        }
      });
    return response.data.component.measures[0].period.value;
  };
  const getSeverity = async () => {
    // const response = await fetch(
    //   // 'http://localhost:8084/api/issues/search?componentKeys=kings_python&facets=severities&resolved=false&ps=1',
    //   `${sonar}/api/issues/search?componentKeys=${projectKey}&facets=severities&resolved=false&ps=1`,
    //   {
    //     headers: {
    //       // 'Authorization': 'Basic ' + new Buffer('admin' + ':' + '19820101').toString('base64')
    //       'Authorization': 'Basic ' + new Buffer(`${username}:${password}`).toString('base64')
    //     }
    //   });
    // const res = await response.json();
    const response = await axios.get(
      // 'http://localhost:8084/api/issues/search?componentKeys=kings_python&facets=severities&resolved=false&ps=1',
      `${sonar}/api/issues/search?componentKeys=${projectKey}&facets=severities&resolved=false&ps=1`,
      {
        headers: {
          // 'Authorization': 'Basic ' + new Buffer('admin' + ':' + '19820101').toString('base64')
          // 'Authorization': 'Basic ' + new Buffer(`${username}:${password}`).toString('base64')
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
    // const url = 'https://hooks.slack.com/services/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'
    // const webhook = new IncomingWebhook(url);
    const webhook = new IncomingWebhook(webhookUrl);
    await webhook.send({text});
  }

  let message = ''
  const cognitiveComplexity = await getCognitiveComplexity()
  console.log(cognitiveComplexity)
  core.info(cognitiveComplexity);

  message += `cognitive_complexity: ${cognitiveComplexity}\n`
  if (onNewCode === 'off') {
    const coverage = await getCoverage();
    console.log(coverage)
    core.info(coverage);

    message += `coverage: ${coverage}\n`
    const codeSmells = await getCodeSmells();
    console.log(codeSmells)
    core.info(codeSmells);

    message += `code_smells: ${codeSmells}\n`
  } else {
    const coverage4NewCode = await getCoverage4NewCode();
    console.log(coverage4NewCode)
    core.info(coverage4NewCode);

    message += `coverage_new_code: ${coverage4NewCode}\n`
    const codeSmells4NewCode = await getCodeSmells4NewCode();
    console.log(codeSmells4NewCode)
    core.info(codeSmells4NewCode);

    message += `code_smells_new_code: ${coverage4NewCode}\n`
  }
  const severity = await getSeverity();
  console.log(severity)
  core.info(severity);

  message += `severity: \n${severity}\n`

  await slack(`${mention}\n${message}`);
};

run()