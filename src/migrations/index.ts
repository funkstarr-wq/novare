import * as migration_20261017_155959_initial from './20261017_155959_initial';
import * as migration_20261017_195708_data_model from './20261017_195708_data_model';

export const migrations = [
  {
    up: migration_20261017_155959_initial.up,
    down: migration_20261017_155959_initial.down,
    name: '20261017_155959_initial',
  },
  {
    up: migration_20261017_195708_data_model.up,
    down: migration_20261017_195708_data_model.down,
    name: '20261017_195708_data_model'
  },
];
