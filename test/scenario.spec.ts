import { Scenario, ScenarioContext } from "../src";
import { mockObject } from "./support/mock-object";

describe('Scenario', () => {
  it('sets Scenario.current', () => {
    const code = jest.fn(async () => {
      expect(Scenario.current.get()).toEqual({ scenario, context });
    });

    const scenario = new Scenario("test", code);
    const context = mockObject<ScenarioContext>({
      reporter: mockObject()
    });

    scenario.run(context);

    expect(code).toHaveBeenCalled();
  });

  it('calls onScenarioStart and onScenarioComplete on reporter', async () => {
    const scenario = new Scenario("test", async () => {});
    const context = mockObject<ScenarioContext>({
      reporter: mockObject()
    });

    await scenario.run(context);

    expect(context.reporter.onScenarioStart).toHaveBeenCalledWith(scenario, context);
    expect(context.reporter.onScenarioComplete).toHaveBeenCalledWith(scenario, context);
  });

  it('calls onScenarioComplete even on error', async () => {
    const scenario = new Scenario("test", async () => {
      throw new Error('expected error');
    });
    const context = mockObject<ScenarioContext>({
      reporter: mockObject()
    });

    await expect(scenario.run(context)).rejects.toHaveProperty('message', 'expected error');

    expect(context.reporter.onScenarioStart).toHaveBeenCalledWith(scenario, context);
    expect(context.reporter.onScenarioComplete).toHaveBeenCalledWith(scenario, context);
  });
});
