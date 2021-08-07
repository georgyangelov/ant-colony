import { Scenario } from 'ant-colony';

export const browsingHomePageScenario = new Scenario(
  'Browsing home page',
  async ({ fetch }) => {
    await fetch('http://localhost:8080/');
  }
);
