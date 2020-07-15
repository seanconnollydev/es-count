import PropTypes from 'prop-types';
import _isEmpty from 'lodash/isEmpty';
import _map from 'lodash/map';
import _find from 'lodash/find';
import _values from 'lodash/values';
import {
  Modal, Form, Button, Popup, Icon, Message,
} from 'semantic-ui-react';
import { withFormik } from 'formik';
import { FORMIK_PROP_TYPES } from '@gloojs/react-lib/constants';
import { mb0 } from '@gloojs/bass-ui/margin';
import { linkStyles } from './NewDeploymentModal.styles';
import labelStyles from './Label.styles';

const BARNA_CHURCHPULSE_CONGREGANT_ASSESSMENT_ID = 'QXNzZXNzbWVudHwxNTgyMzY2NzgxODY3MDM0MjY0';

const MIN_AUDIENCE_COUNT = 6;

const generateDeploymentName = name => `${name} ${new Date().getMonth() + 1} ${new Date().getFullYear()}`; // getMonth() is zero based

const generateDeploymentNameFromId = (assessmentId, assessments) => {
  const assessment = _find(assessments, ['id', assessmentId]);
  if (assessment) {
    return generateDeploymentName(assessment.title);
  }
  return '';
};

const expectedAudienceCountLabel = 'How many people do you plan to send this to? ';
const expectedAudienceCountPopupContent = 'To provide you the most accurate report possible, we need to ensure at least 25% of your anticipated audience has completed the assessment. Often, data from a small sample is not representative of the larger audience.';

const namePopupContent = 'Users won’t see this name. We’ll use this name for progress tracking and reporting.';

const ModalLabel = ({ label, popupContent }) => (
  <div css={labelStyles}>
    <span>{label}</span>
    <Popup
      hoverable
      trigger={<Icon className="small-question-line" />}
    >
      <Popup.Content>{popupContent}</Popup.Content>
    </Popup>
  </div>
);

ModalLabel.propTypes = {
  label: PropTypes.string.isRequired,
  popupContent: PropTypes.string.isRequired,
};

const multipleLocationsPopupContent = 'If your organization has multiple locations, we recommend configuring an assessment for each location so you can segment results and manage who has access to each location\'s results. Click on the Profile icon in the main navigation bar and select "Administration".';

const MultipleLocationsPopup = () => (
  <Popup
    hoverable
    trigger={<div css={linkStyles}>What if I have multiple locations?</div>}
  >
    <Popup.Content>
      <div>{multipleLocationsPopupContent}</div>
    </Popup.Content>
  </Popup>
);

const NewDeploymentModal = (props) => {
  const {
    assessmentId,
    assessments,
    isLoadingAssessments,
    onClose,
  } = props;

  const {
    errors,
    handleBlur,
    handleChange,
    handleSubmit,
    isSubmitting,
    values,
    submitCount,
    setFieldValue,
    setFieldTouched,
  } = props; // Formik props

  const showError = checkForEmpty => submitCount > 0 && !_isEmpty(checkForEmpty);

  const assessmentOptions = _map(assessments, assessment => ({ text: assessment.title, value: assessment.id }));

  const isConfiguringBarnaChurchPulseCongregantAssessment = values.selectedAssessmentId === BARNA_CHURCHPULSE_CONGREGANT_ASSESSMENT_ID;

  const modalHeaderText = isConfiguringBarnaChurchPulseCongregantAssessment ? 'Two quick questions' : 'New Assessment Configuration';

  const handleSelectedAssessmentChange = (data) => {
    setFieldValue('selectedAssessmentId', data.value);
    setFieldValue('name', generateDeploymentNameFromId(data.value, assessments));
  };

  return (
    <Modal open size="tiny" onClose={onClose} closeIcon>
      <Modal.Header>{modalHeaderText}</Modal.Header>
      <Modal.Content>
        <Form data-testid="form" id="newAssessmentConfigModalForm" onSubmit={handleSubmit} noValidate>
          {!assessmentId && (
            <Form.Select
              search
              loading={isLoadingAssessments}
              label="Choose an assessment."
              options={assessmentOptions}
              value={values.selectedAssessmentId}
              error={showError(errors.selectedAssessmentId)}
              onBlur={() => setFieldTouched('selectedAssessmentId')}
              onChange={(e, data) => handleSelectedAssessmentChange(data)}
              name="selectedAssessmentId"
              data-cy="select-assessment"
            />
          )}
          {isConfiguringBarnaChurchPulseCongregantAssessment && (
            <>
              <Form.Input
                onBlur={handleBlur}
                onChange={handleChange}
                type="number"
                min={MIN_AUDIENCE_COUNT}
                value={values.expectedAudienceCount}
                error={showError(errors.expectedAudienceCount)}
                label={<ModalLabel label={expectedAudienceCountLabel} popupContent={expectedAudienceCountPopupContent} />}
                name="expectedAudienceCount"
                data-cy="input-expected-audience-count"
              />
              <MultipleLocationsPopup />
            </>
          )}
          <Form.Input
            css={mb0}
            onBlur={handleBlur}
            onChange={handleChange}
            type="text"
            value={values.name}
            error={showError(errors.name)}
            label={<ModalLabel label="What would you like to name this configuration?" popupContent={namePopupContent} />}
            name="name"
            data-cy="input-deployment-name"
          />
        </Form>
      </Modal.Content>
      <Message
        error
        header="There are some errors with your submission"
        list={_values(errors)}
        hidden={!showError(errors)}
      />
      <Modal.Actions>
        <Button basic color="black" content="Cancel" onClick={onClose} />
        <Button
          primary
          content="Save"
          disabled={showError(errors) || isSubmitting}
          loading={isSubmitting}
          type="submit"
          form="newAssessmentConfigModalForm"
          data-cy="button-deployment-create"
        />
      </Modal.Actions>
    </Modal>
  );
};

NewDeploymentModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
  assessmentId: PropTypes.string, // eslint-disable-line react/no-unused-prop-types
  assessmentName: PropTypes.string, // eslint-disable-line react/no-unused-prop-types
  assessments: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
  })),
  isLoadingAssessments: PropTypes.bool.isRequired,
  ...FORMIK_PROP_TYPES,
};

NewDeploymentModal.defaultProps = {
  assessmentName: null,
  assessmentId: null,
  assessments: [],
};

const validate = (values) => {
  const errors = {};

  if (!values.name) {
    errors.name = 'Name is required';
  }

  if (!values.selectedAssessmentId) {
    errors.selectedAssessmentId = 'Assessment is required';
  }

  if (values.selectedAssessmentId === BARNA_CHURCHPULSE_CONGREGANT_ASSESSMENT_ID) {
    if (!values.expectedAudienceCount) {
      errors.expectedAudienceCount = 'Audience count is required';
    } else if (values.expectedAudienceCount < MIN_AUDIENCE_COUNT) {
      errors.expectedAudienceCount = `Audience count must be greater than ${MIN_AUDIENCE_COUNT - 1}`;
    }
  }

  return errors;
};

const handleSubmit = async (values, stateAndHelpers) => {
  const { props, setSubmitting } = stateAndHelpers;
  const { onSave } = props;

  await onSave({
    assessmentId: values.selectedAssessmentId,
    name: values.name,
    expectedAudienceCount: values.expectedAudienceCount,
  });

  setSubmitting(false); // finish the Formik submission cycle
};

const mapPropsToValues = props => ({
  name: props.assessmentName ? generateDeploymentName(props.assessmentName) : '',
  selectedAssessmentId: props.assessmentId || '',
  expectedAudienceCount: '',
});

export default withFormik({
  handleSubmit,
  mapPropsToValues,
  validate,
})(NewDeploymentModal);