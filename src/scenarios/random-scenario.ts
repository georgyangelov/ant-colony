import { sortBy, sumBy } from "lodash";
import { IScenario, ScenarioContext } from "../scenarios";

export interface RandomScenarioOption {
  scenario: IScenario;
  weight: number;
}

export class RandomScenario {
  private maxWeight: number;

  constructor(
    private scenarios: RandomScenarioOption[]
  ) {
    if (scenarios.length === 0) {
      throw new Error('RandomScenario must have at least one scenario');
    }

    this.scenarios = sortBy(this.scenarios, _ => _.weight);
    this.maxWeight = sumBy(this.scenarios, _ => _.weight);
  }

  async run(context: ScenarioContext) {
    return this.selectRandomScenario().scenario.run(context);
  }

  private selectRandomScenario() {
    const random = Math.random() * this.maxWeight;
    let currentSum = 0;

    for (let i = 0; i < this.scenarios.length; i++) {
      const scenario = this.scenarios[i]!;
      currentSum += scenario.weight!;

      if (currentSum >= random) {
        return scenario;
      }
    }

    return this.scenarios[this.scenarios.length - 1]!;
  }
}
