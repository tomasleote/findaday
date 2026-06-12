import { vacationPages } from './vacation';
import { alternativePages } from './alternatives';
import { socialPages } from './social';
import { professionalPages } from './professional';

export const landingPagesConfig = {
    ...vacationPages,
    ...alternativePages,
    ...socialPages,
    ...professionalPages,
};
