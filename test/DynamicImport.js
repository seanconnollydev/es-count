import React from 'react';
import dynamic from 'next/dynamic';
import _compose from 'lodash/fp/compose';

import withDeploymentConfigProvider from '@components/withDeploymentConfigProvider';
import withDeploymentSessionProvider from '@components/withDeploymentSessionProvider';
import { ASSESSMENT } from '@lib/constants/viewer-steps';
import { getViewersStep } from '@lib/getViewersStep';
import redirect from '@lib/redirect';

// AssessmentItemsContainer is dependent on local storage for intial render
const AssessmentItemsContainerWithNoSSR = dynamic(() => import('../../../components/AssessmentItemsContainer'), {
  ssr: false,
});

const Assessment = () => (
  <AssessmentItemsContainerWithNoSSR />
);

Assessment.getInitialProps = async (ctx) => {
  const { deploymentConfig, deploymentSession } = ctx;
  const deploymentId = deploymentConfig.id;

  if (getViewersStep({ deploymentConfig, deploymentSession }) !== ASSESSMENT) {
    redirect({
      url: '/a/[deploymentId]/details',
      as: `/a/${deploymentId}/details`,
      replace: true,
      ctx,
    });
  }
};

export default _compose(
  withDeploymentConfigProvider,
  withDeploymentSessionProvider(),
)(Assessment);
