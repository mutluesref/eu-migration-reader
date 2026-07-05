import { useCallback } from 'react';
import { useStore } from '../store';

const STEPS = ['welcome', 'navigate', 'search', 'references', 'keyboard'] as const;
type Step = (typeof STEPS)[number];

export default function useOnboarding() {
  const showOnboarding = useStore((s) => s.showOnboarding);
  const dismissOnboarding = useStore((s) => s.dismissOnboarding);
  const rawStep = useStore((s) => s._onboardingStep ?? 0);
  const step: Step = STEPS[Math.min(rawStep, STEPS.length - 1)] ?? 'welcome';

  const nextStep = useCallback(() => {
    useStore.setState((s) => {
      const current = s._onboardingStep ?? 0;
      if (current >= STEPS.length - 1) {
        localStorage.setItem('eu-reader-onboarded', '1');
        return { showOnboarding: false, _onboardingStep: 0 };
      }
      return { _onboardingStep: current + 1 };
    });
  }, []);

  const prevStep = useCallback(() => {
    useStore.setState((s) => {
      const current = s._onboardingStep ?? 0;
      return { _onboardingStep: Math.max(0, current - 1) };
    });
  }, []);

  return {
    showOnboarding,
    dismissOnboarding,
    step,
    stepIndex: Math.min(rawStep, STEPS.length - 1),
    totalSteps: STEPS.length,
    nextStep,
    prevStep,
  };
}
