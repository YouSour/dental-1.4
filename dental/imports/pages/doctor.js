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
import {Doctor} from '../../common/collections/doctor.js';

// Tabular
import {DoctorTabular} from '../../common/tabulars/doctor.js';

// Page
import './doctor.html';

// Declare template
let indexTmpl = Template.Dental_doctor,
    contactTmpl = Template.Dental_doctorContact,
    formTmpl = Template.Dental_doctorForm,
    showTmpl = Template.Dental_doctorShow;


// Index
indexTmpl.onCreated(function () {
    // Create new  alertify
    createNewAlertify('doctor', {size: 'lg'});
    createNewAlertify('doctorShow',);
});

indexTmpl.helpers({
    tabularTable(){
        return DoctorTabular;
    },
    selector() {
        return {branchId: Session.get('currentByBranch')};
    }
});

indexTmpl.events({
    'click .js-create' (event, instance) {
        alertify.doctor(fa('plus', 'Doctor'), renderTemplate(formTmpl));
    },
    'click .js-update' (event, instance) {
        alertify.doctor(fa('pencil', 'Doctor'), renderTemplate(formTmpl, {doctorId: this._id}));
    },
    'click .js-destroy' (event, instance) {
        destroyAction(
            Doctor,
            {_id: this._id},
            {title: 'Doctor', itemTitle: this._id}
        );
    },
    'click .js-display' (event, instance) {
        alertify.doctorShow(fa('eye', 'Doctor'), renderTemplate(showTmpl, {doctorId: this._id}));
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
        this.subscribe('dental.lookupValueByNames', ['Gender', 'Position', 'Contact Type']);

        let currentData = Template.currentData();
        if (currentData) {
            this.subscribe('dental.doctorById', currentData.doctorId);
        }
    });
});

formTmpl.helpers({
    collection(){
        return Doctor;
    },
    data () {
        let data = {
            formType: 'insert',
            doc: {}
        };
        let currentData = Template.currentData();

        if (currentData) {
            data.formType = 'update';
            data.doc = Doctor.findOne(currentData.doctorId);
        }

        return data;
    }
});

// Show
showTmpl.onCreated(function () {
    this.autorun(()=> {
        let currentData = Template.currentData();
        this.subscribe('dental.doctorById', currentData.doctorId);
    });
});

showTmpl.helpers({
    data () {
        let currentData = Template.currentData();
        let data = Doctor.findOne(currentData.doctorId);

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
            alertify.doctor().close();
        }
        displaySuccess();
    },
    onError (formType, error) {
        displayError(error.message);
    }
};

AutoForm.addHooks(['Dental_doctorForm'], hooksObject);
