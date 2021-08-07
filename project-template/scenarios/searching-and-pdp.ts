import { Scenario } from 'ant-colony';

export const searchingAndPDPScenario = new Scenario(
  'Searching and PDP',
  async ({ fetch }) => {
    await fetch('http://localhost:8080/');
    await fetch('http://localhost:8080/search?q=product');
    await fetch('http://localhost:8080/products/42');
  }
);
