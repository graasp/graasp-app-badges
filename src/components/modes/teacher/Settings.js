import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Modal from '@material-ui/core/Modal';
import Switch from '@material-ui/core/Switch';
import Select from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { connect } from 'react-redux';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { withTranslation } from 'react-i18next';
import { closeSettings, patchAppInstance } from '../../../actions';
import { options as langOptions } from '../../../constants/langs';

function getModalStyle() {
  const top = 50;
  const left = 50;
  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const styles = theme => ({
  paper: {
    position: 'absolute',
    width: theme.spacing.unit * 50,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing.unit * 4,
    outline: 'none',
  },
  button: {
    margin: theme.spacing.unit,
  },
});

class Settings extends Component {
  static propTypes = {
    classes: PropTypes.shape({}).isRequired,
    open: PropTypes.bool.isRequired,
    settings: PropTypes.shape({
      headerVisible: PropTypes.bool.isRequired,
      lang: PropTypes.string.isRequired,
    }).isRequired,
    t: PropTypes.func.isRequired,
    dispatchCloseSettings: PropTypes.func.isRequired,
    dispatchPatchAppInstance: PropTypes.func.isRequired,
    i18n: PropTypes.shape({
      defaultNS: PropTypes.string,
    }).isRequired,
    badgeOptions: PropTypes.arrayOf(
      PropTypes.shape({ label: PropTypes.element, value: PropTypes.number })
    ).isRequired,
  };

  saveSettings = settingsToChange => {
    const { settings, dispatchPatchAppInstance } = this.props;
    const newSettings = {
      ...settings,
      ...settingsToChange,
    };
    dispatchPatchAppInstance({
      data: newSettings,
    });
  };

  handleChangeHeaderVisibility = () => {
    const {
      settings: { headerVisible },
    } = this.props;
    const settingsToChange = {
      headerVisible: !headerVisible,
    };
    this.saveSettings(settingsToChange);
  };

  handleClose = () => {
    const { dispatchCloseSettings } = this.props;
    dispatchCloseSettings();
  };

  handleChangeLanguage = selectedLanguage => {
    const { i18n } = this.props;
    const { value } = selectedLanguage;
    i18n.changeLanguage(value);
    // language needs to go under context object
    // as it overrides the context the app is running in
    const settingsToChange = {
      context: {
        lang: value,
      },
    };
    this.saveSettings(settingsToChange);
  };

  handleChangeGroup = selectedGroup => {
    const { value } = selectedGroup;
    const settingsToChange = {
      badgeGroup: value,
    };
    this.saveSettings(settingsToChange);
  };

  render() {
    const { t, i18n, classes, open, settings, badgeOptions } = this.props;

    const { headerVisible, badgeGroup } = settings;

    const { language } = i18n;
    const selectedLanguage = langOptions.find(
      langOption => langOption.value === language
    );
    const selectedGroup = badgeOptions.find(
      badgeOption => badgeOption.value === badgeGroup
    );

    const switchControl = (
      <Switch
        color="primary"
        checked={headerVisible}
        onChange={this.handleChangeHeaderVisibility}
        value="headerVisibility"
      />
    );

    return (
      <div>
        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={open}
          onClose={this.handleClose}
        >
          <div style={getModalStyle()} className={classes.paper}>
            <Typography variant="h5" id="modal-title">
              {t('Settings')}
            </Typography>
            <FormControlLabel
              control={switchControl}
              label={t('Header visible')}
            />
            <Typography variant="h6">{t('Language')}</Typography>
            <Select
              // default selected value is the first language option
              className="select"
              defaultValue={langOptions[0]}
              options={langOptions}
              value={selectedLanguage}
              onChange={this.handleChangeLanguage}
            />
            <Typography variant="h6">{t('Reward Type')}</Typography>
            <Select
              // default selected value is the first language option
              className="select"
              defaultValue={badgeOptions[0]}
              options={badgeOptions}
              value={selectedGroup}
              onChange={this.handleChangeGroup}
            />
          </div>
        </Modal>
      </div>
    );
  }
}

const mapStateToProps = ({ settings, appInstance, badges }, ownProps) => {
  const { t } = ownProps;
  return {
    open: settings.open,
    badgeOptions: badges.groups.map(({ name, badges: _badges }, index) => ({
      label: (
        <div>
          <FontAwesomeIcon color="stormgray" icon={_badges[0].icon} />
          {` ${t(name)}`}
        </div>
      ),
      value: index,
    })),
    settings: {
      lang: settings.lang,
      // by default this is true
      headerVisible: appInstance.settings.headerVisible,
      // by default this is 0
      badgeGroup: appInstance.settings.badgeGroup,
    },
  };
};

const mapDispatchToProps = {
  dispatchCloseSettings: closeSettings,
  dispatchPatchAppInstance: patchAppInstance,
};

const ConnectedComponent = connect(
  mapStateToProps,
  mapDispatchToProps
)(Settings);
const TranslatedComponent = withTranslation()(ConnectedComponent);

export default withStyles(styles)(TranslatedComponent);
