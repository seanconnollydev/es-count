import React, { useState } from 'react';
import PropTypes from 'prop-types';
import _capitalize from 'lodash/capitalize';
import { Button, Header, Pagination, Table, Icon } from 'semantic-ui-react'; // eslint-disable-line object-curly-newline
import { my0 } from '@gloojs/bass-ui/margin';
import format from 'date-fns/format';
import Link from 'next/link';

import { useRouter } from 'next/router';
import { NETWORK_STATUS } from '@lib/constants/network-status';
import { useProducts } from '@components/ProductsContext';
import EditAudienceSizeModalContainer from '@components/EditAudienceSizeModalContainer';
import EmptyState from '@components/EmptyState';
import ErrorMessage from '@components/ErrorMessage';
import LoadingMessage from '@components/LoadingMessage';
import NewDeploymentModalContainer from '@components/NewDeploymentModalContainer';
import { deploymentTableHeaderStyles, iconStyles } from './DeploymentTable.styles';
import AnalyzeIcon from '../public/img/analyze-icon.svg';
import ShareIcon from '../public/img/share-icon.svg';
import EmptyImage from '../public/img/zero-state-library.svg';

const DeploymentTable = (props) => {
  const {
    networkStatus,
    error,
    deployments,
    activeSort,
    activeOrder,
    activePage,
    totalPages,
  } = props;

  const router = useRouter();
  const { locationId } = router.query;

  const { hasPremiumProduct } = useProducts();

  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isEditAudienceSizeModalOpen, setIsEditAudienceSizeModalOpen] = useState(false);
  const [deploymentIdToEdit, setDeploymentIdToEdit] = useState('');

  const handleExpectedAudienceCountIconClick = (id) => {
    setDeploymentIdToEdit(id);
    setIsEditAudienceSizeModalOpen(true);
  };

  const handlePageChange = (event, data) => {
    const { onPageChange } = props;
    onPageChange(data.activePage);
  };

  const handleSort = (sort) => {
    const { onSortChange } = props;
    onSortChange(sort);
  };

  const orderMap = { ASC: 'ascending', DESC: 'descending' };

  const getSortableProps = sort => ({
    sorted: activeSort === sort ? orderMap[activeOrder] : null,
    onClick: () => handleSort(sort),
  });

  const getEndDate = (deployment) => {
    if (deployment.startsAt && !deployment.endsAt) {
      return 'Open Ended';
    }

    return <StackedDateTime utc={deployment.endsAt} />;
  };

  const linkHrefPrefix = '/loc/[locationId]';
  const linkAsPrefix = `/loc/${locationId}`;

  // Empty
  if (networkStatus === NETWORK_STATUS.READY && deployments.length === 0) {
    return (
      <EmptyState
        headline="Get started with your first assessment"
        subHeadline="Collect valuable data & gain new insights into your audience by configuring an assessment."
        buttonText="Select an Assessment from the Library"
        onButtonClick={() => router.push(`${linkHrefPrefix}/library`, `${linkAsPrefix}/library`)}
      >
        <EmptyImage />
      </EmptyState>
    );
  }

  if (networkStatus === NETWORK_STATUS.LOADING) {
    return <LoadingMessage inline text="Loading your assessments..." />;
  }

  if (error) {
    return <ErrorMessage text="There was an error loading your assessments." />;
  }

  return (
    <>
      <div css={deploymentTableHeaderStyles}>
        <Header as="h1" css={my0}>My Assessments</Header>
        <Button
          floated="right"
          primary
          onClick={() => setIsConfigModalOpen(true)}
          className="new-deployment"
          data-cy="button-configure-new-assessment"
          content="Configure New Assessment"
        />
      </div>
      {isConfigModalOpen && <NewDeploymentModalContainer onClose={() => setIsConfigModalOpen(false)} />}
      <Table fixed sortable>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell {...getSortableProps('NAME')} content="Name" width="4" />
            <Table.HeaderCell {...getSortableProps('ASSESSMENT_TITLE')} content="Assessment" width="3" />
            <Table.HeaderCell {...getSortableProps('STATE')} content="Status" />
            {hasPremiumProduct && (
              <>
                <Table.HeaderCell {...getSortableProps('STARTS_AT')} content="Start Date" />
                <Table.HeaderCell {...getSortableProps('ENDS_AT')} content="End Date" />
              </>
            )}
            <Table.HeaderCell content="Estimated Participants" />
            <Table.HeaderCell {...getSortableProps('COMPLETED_COUNT')} content="Completions" />
            <Table.HeaderCell content="Share" />
            <Table.HeaderCell content="Results" />
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {deployments && deployments.map(deployment => (
            <Table.Row key={deployment.id}>
              <Table.Cell>
                <Link
                  href={`${linkHrefPrefix}/my-assessments/[deploymentId]/options`}
                  as={`${linkAsPrefix}/my-assessments/${deployment.id}/options`}
                >
                  <a data-cy="deployment-name" data-cy-deployment-id={deployment.id}>{deployment.name}</a>
                </Link>
                <div><small>{`Created ${format(deployment.createdAt, 'MM/DD/YYYY')}`}</small></div>
              </Table.Cell>
              <Table.Cell content={deployment.assessment.title} />
              <Table.Cell content={_capitalize(deployment.state)} />
              {hasPremiumProduct && (
                <>
                  <Table.Cell content={<StackedDateTime utc={deployment.startsAt} />} />
                  <Table.Cell content={getEndDate(deployment)} />
                </>
              )}
              <Table.Cell>
                <span>{deployment.expectedAudienceCount || 'n/a'}</span>
                { deployment.expectedAudienceCount && (
                  <Icon
                    css={iconStyles}
                    onClick={() => handleExpectedAudienceCountIconClick(deployment.id)}
                    className="large-edit-line"
                  />
                )}
              </Table.Cell>
              <Table.Cell content={deployment.activity.completions} />
              <Table.Cell>
                <Link
                  href={`${linkHrefPrefix}/my-assessments/[deploymentId]/share`}
                  as={`${linkAsPrefix}/my-assessments/${deployment.id}/share`}
                >
                  <a><ShareIcon /></a>
                </Link>
              </Table.Cell>
              <Table.Cell>
                <Link
                  href={`${linkHrefPrefix}/my-assessments/[deploymentId]/results`}
                  as={`${linkAsPrefix}/my-assessments/${deployment.id}/results`}
                >
                  <a><AnalyzeIcon /></a>
                </Link>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>

        <Table.Footer>
          <Table.Row>
            <Table.HeaderCell colSpan={hasPremiumProduct ? 9 : 7}>
              <Pagination
                activePage={activePage}
                onPageChange={handlePageChange}
                boundaryRange={1}
                siblingRange={1}
                totalPages={totalPages}
                firstItem={null}
                lastItem={null}
                floated="right"
              />
            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>
      </Table>
      {isEditAudienceSizeModalOpen && (
        <EditAudienceSizeModalContainer
          setIsEditAudienceSizeModalOpen={setIsEditAudienceSizeModalOpen}
          deploymentId={deploymentIdToEdit}
        />
      )}
    </>
  );
};

DeploymentTable.propTypes = {
  networkStatus: PropTypes.number.isRequired,
  error: PropTypes.object, /* eslint-disable-line react/forbid-prop-types */
  deployments: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    state: PropTypes.string,
    createdAt: PropTypes.string,
    startsAt: PropTypes.string,
    endsAt: PropTypes.string,
    assessment: PropTypes.shape({
      id: PropTypes.string,
      title: PropTypes.string,
    }),
  })).isRequired,
  activeSort: PropTypes.string.isRequired,
  activeOrder: PropTypes.string.isRequired,
  activePage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onSortChange: PropTypes.func.isRequired,
};

DeploymentTable.defaultProps = {
  error: null,
};

const StackedDateTime = (props) => {
  const { utc } = props;
  if (!utc) return null;

  return (
    <>
      <div>{format(utc, 'MM/DD/YYYY')}</div>
      <div>{format(utc, 'h:mm A')}</div>
    </>
  );
};

StackedDateTime.propTypes = {
  utc: PropTypes.string,
};

StackedDateTime.defaultProps = {
  utc: null,
};

export default DeploymentTable;