import {Template} from 'meteor/templating';
import {AutoForm} from 'meteor/aldeed:autoform';
import {Roles} from  'meteor/alanning:roles';
import {alertify} from 'meteor/ovcharik:alertifyjs';
import {sAlert} from 'meteor/juliancwirko:s-alert';
import {fa} from 'meteor/theara:fa-helpers';
import {lightbox} from 'meteor/theara:lightbox-helpers';
import {TAPi18n} from 'meteor/tap:i18n';
import {ReactiveTable} from 'meteor/aslagle:reactive-table';
import {moment} from 'meteor/momentjs:moment';

// Lib
import {createNewAlertify} from '../../../core/client/libs/create-new-alertify.js';
import {reactiveTableSettings} from '../../../core/client/libs/reactive-table-settings.js';
import {renderTemplate} from '../../../core/client/libs/render-template.js';
import {destroyAction} from '../../../core/client/libs/destroy-action.js';
import {displaySuccess, displayError} from '../../../core/client/libs/display-alert.js';
import {__} from '../../../core/common/libs/tapi18n-callback-helper.js';

// Component
import '../../../core/client/components/loading.js';
import '../../../core/client/components/column-action.js';
import '../../../core/client/components/form-footer.js';

// Collection
import {Patient} from '../../common/collections/patient.js';

// Tabular
import {PatientTabular} from '../../common/tabulars/patient.js';

// Page
import './patient.html';

// Declare template
let indexTmpl = Template.Dental_patient,
    contactTmpl = Template.Dental_patientContact,
    formTmpl = Template.Dental_patientForm,
    showTmpl = Template.Dental_patientShow;


// Index
indexTmpl.onCreated(function () {
    // Create new  alertify
    createNewAlertify('patient', {size: 'lg'});
    createNewAlertify('patientShow',);
});

indexTmpl.helpers({
    tabularTable(){
        return PatientTabular;
    },
    selector() {
        return {branchId: Session.get('currentByBranch')};
    }
});

indexTmpl.events({
    'click .js-create' (event, instance) {
        alertify.patient(fa('plus', 'Patient'), renderTemplate(formTmpl));
    },
    'click .js-update' (event, instance) {
        alertify.patient(fa('pencil', 'Patient'), renderTemplate(formTmpl, {patientId: this._id}));
    },
    'click .js-destroy' (event, instance) {
        destroyAction(
            Patient,
            {_id: this._id},
            {title: 'Patient', itemTitle: this._id}
        );
    },
    'click .js-display' (event, instance) {
        alertify.patientShow(fa('eye', 'Patient'), renderTemplate(showTmpl, {patientId: this._id}));
    }
});

// Contact tabular
contactTmpl.helpers({
    jsonViewOpts () {
        return {collapsed: true};
    }
});

// Form
formTmpl.onCreated(function () {
    this.autorun(()=> {
        // Lookup value
        this.subscribe('dental.lookupValueByNames', ['Gender','Member','Contact Type']);

        this.subscribe('dental.caseHistory');
        let currentData = Template.currentData();
        if (currentData) {
            this.subscribe('dental.patientById', currentData.patientId);
        }
    });
});

formTmpl.helpers({
    collection(){
        return Patient;
    },
    data () {
        let data = {
            formType: 'insert',
            doc: {}
        };
        let currentData = Template.currentData();

        if (currentData) {
            data.formType = 'update';
            data.doc = Patient.findOne(currentData.patientId);
        }

        return data;
    }
});

// Show
showTmpl.onCreated(function () {
    this.autorun(()=> {
        let currentData = Template.currentData();
        this.subscribe('dental.patientById', currentData.patientId);
    });
});

showTmpl.helpers({
    data () {
        let currentData = Template.currentData();
        let data = Patient.findOne(currentData.patientId);

        data.photoUrl = null;
        if (data.photo) {
            let img = Files.findOne(data.photo);
            if (img) {
                data.photoUrl = img.url();
            }
        }

        return data;
    }
});

// Hook
let hooksObject = {
    onSuccess (formType, result) {
        if (formType == 'update') {
            alertify.patient().close();
        }
        displaySuccess();
    },
    onError (formType, error) {
        displayError(error.message);
    }
};

AutoForm.addHooks(['Dental_patientForm'], hooksObject);
