import * as migration_20261017_155959_initial from './20261017_155959_initial';
import * as migration_20261017_195708_data_model from './20261017_195708_data_model';
import * as migration_20261017_203529_roles_review from './20261017_203529_roles_review';
import * as migration_20261018_091131_two_factor from './20261018_091131_two_factor';
import * as migration_20261018_193116_seo_noindex from './20261018_193116_seo_noindex';
import * as migration_20261018_205009_ai_editor from './20261018_205009_ai_editor';

export const migrations = [
  {
    up: migration_20261017_155959_initial.up,
    down: migration_20261017_155959_initial.down,
    name: '20261017_155959_initial',
  },
  {
    up: migration_20261017_195708_data_model.up,
    down: migration_20261017_195708_data_model.down,
    name: '20261017_195708_data_model',
  },
  {
    up: migration_20261017_203529_roles_review.up,
    down: migration_20261017_203529_roles_review.down,
    name: '20261017_203529_roles_review',
  },
  {
    up: migration_20261018_091131_two_factor.up,
    down: migration_20261018_091131_two_factor.down,
    name: '20261018_091131_two_factor',
  },
  {
    up: migration_20261018_193116_seo_noindex.up,
    down: migration_20261018_193116_seo_noindex.down,
    name: '20261018_193116_seo_noindex',
  },
  {
    up: migration_20261018_205009_ai_editor.up,
    down: migration_20261018_205009_ai_editor.down,
    name: '20261018_205009_ai_editor'
  },
];
