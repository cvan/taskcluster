const MonitorManager = require('taskcluster-lib-monitor');

const manager = new MonitorManager({
  serviceName: 'worker-manager',
});

manager.register({
  name: 'workertypeProvisioned',
  title: 'Workertype Provisioned',
  type: 'workertype-provisioned',
  version: 1,
  level: 'info',
  description: 'A workerType\'s provisioning run has completed',
  fields: {
    workerType: 'The name of the workertype.',
    provider: 'The name of the provider that did the work for this workertype.',
  },
});

manager.register({
  name: 'simpleEstimate',
  title: 'Simple Estimate Provided',
  type: 'simple-estimate',
  version: 1,
  level: 'notice',
  description: 'The simple estimator has decided that we need some number of instances.',
  fields: {
    workerType: 'The name of the workertype.',
    pendingTasks: 'The number of tasks the queue reports are pending for this workerType',
    minCapacity: 'The minimum amount of capacity that should be running',
    maxCapacity: 'The maximum amount of capacity that should be running',
    capacityPerInstance: 'Amount of capacity a single instance provides',
    currentSize: 'Number of currently requested instances',
    desiredSize: 'Number that this estimator thinks we should have',
  },
});

module.exports = manager;
