import { Executor, PhaseContext, Scenario, SingleRunPhase } from '../../src';
import { mockObject } from '../support/mock-object';

describe('SingleRunPhase', () => {
  it('runs a scenario once', async () => {
    const scenario = mockObject<Scenario>();
    const phase = new SingleRunPhase({ name: 'single', scenario });

    expect(phase.name).toEqual('single');
    expect(phase.scenario).toEqual(scenario);

    const context = mockObject<PhaseContext>({
      reporter: mockObject(),
      executor: mockObject<Executor>({
        runSingle: jest.fn(async () => ({ reporterData: 1234 }))
      })
    });

    await phase.run(context);

    expect(context.reporter.onPhaseStart).toHaveBeenCalledWith(phase, context);
    expect(context.executor.runSingle).toHaveBeenCalledWith(phase.name, {});
    expect(context.reporter.onPhaseComplete).toHaveBeenCalledWith(
      phase,
      context
    );
  });
});
