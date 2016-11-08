import {Template} from 'meteor/templating';
import {AutoForm} from 'meteor/aldeed:autoform';
import {Roles} from 'meteor/alanning:roles';
import {alertify} from 'meteor/ovcharik:alertifyjs';
import {sAlert} from 'meteor/juliancwirko:s-alert';
import {fa} from 'meteor/theara:fa-helpers';
import {lightbox} from 'meteor/theara:lightbox-helpers';
import {_} from 'meteor/erasaur:meteor-lodash';
import 'meteor/theara:jsonview';
import {TAPi18n} from 'meteor/tap:i18n';
import 'meteor/tap:i18n-ui';


// Lib
import {
    createNewAlertify
} from '../../../core/client/libs/create-new-alertify.js';
import {
    renderTemplate
} from '../../../core/client/libs/render-template.js';
import {
    destroyAction
} from '../../../core/client/libs/destroy-action.js';
import {
    displaySuccess,
    displayError
} from '../../../core/client/libs/display-alert.js';
import {
    __
} from '../../../core/common/libs/tapi18n-callback-helper.js';

// Component
import '../../../core/client/components/loading.js';
import '../../../core/client/components/column-action.js';
import '../../../core/client/components/form-footer.js';

// Method
import {
    lookupRegister
} from '../../common/methods/lookup-register';
import {
    lookupPatient
} from '../../common/methods/lookup-patient.js';

// Collection
import {
    Register
} from '../../common/collections/register.js';

// Tabular
import {
    RegisterTabular
} from '../../common/tabulars/register.js';

// Page
import './register.html';
import './register-items.js';


// Declare template
let indexTmpl = Template.Dental_register,
    actionTmpl = Template.Dental_registerAction,
    formTmpl = Template.Dental_registerForm,
    statusActionTmpl = Template.Dental_registerClosedDate,
    statusLinkActionTmpl = Template.Dental_statusLinkAction,
    depositAndPaymentLinkActionTmpl = Template.Dental_depositAndPaymentLinkAction,
    showTmpl = Template.Dental_registerShow;

// Local collection
let registerItemsCollection = new Mongo.Collection(null);

// Index
indexTmpl.onCreated(function () {
    // Create new  alertify
    createNewAlertify('register', {
        size: 'lg'
    });
    createNewAlertify('registerClosedDate', {
        size: 'sm'
    });
    createNewAlertify('registerShow');
});

indexTmpl.helpers({
    tabularTable() {
        return RegisterTabular;
    },
    selector() {
        return {
            branchId: Session.get('currentBranch')
        };
    }
});

indexTmpl.events({
    'click .btn-link' (event, instance) {
        checkClosedRegister(this.closedDate);
    },
    'click .js-create' (event, instance) {
        alertify.register(fa('plus', 'Register'), renderTemplate(formTmpl)).maximize();
    },
    'click .js-update' (event, instance) {
        Session.set('update', true);
        let self = this;
        if (self.depositStatus !== "exist") {
            alertify.register(fa('pencil', 'Register'), renderTemplate(formTmpl, {
                registerId: this._id
            })).maximize();
        } else {
            swal({
                title: "Warning",
                type: "warning",
                text: "Hmm , look like this record already deposit , please delete it before edit !",
                timer: 2500,
                showConfirmButton: false
            });
        }
    },
    'click .js-destroy' (event, instance) {
        destroyAction(
            Register, {
                _id: this._id
            }, {
                title: 'Register',
                itemTitle: this._id
            }
        );
    },
    'click .js-status' (event, instance) {
        let self = this;
        Session.set('SetActiveDate', true);
        if (_.isUndefined(this.closedDate)) {
            alertify.registerClosedDate(fa('calendar-check-o', 'Close Register'), renderTemplate(statusActionTmpl, self));
        } else if (self.paymentStatus == "exist") {
            swal({
                title: "Warning",
                type: "warning",
                text: "Hmm , look like this record already payment , please delete it before reactive !",
                timer: 2500,
                showConfirmButton: false
            });
        } else {
            swal({
                title: "Are you sure?",
                text: 'You will reactive this <span class="text-red">[' + this._id + ']</span>!',
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, reactive it!",
                closeOnConfirm: false
            }).then(function () {
                //Reactive record
                Register.update(self._id, {
                    $set: {
                        closedDate: ''
                    }
                });

                swal({
                    title: "Reactive",
                    text: `Your record has been reactive.`,
                    type: "success",
                    allowEscapeKey: false,
                    showCloseButton: true,
                    showConfirmButton: false,
                    allowOutsideClick: true,
                    timer: 1000
                }).done();
            }).done();
        }
    },
    'click .js-deposit' (event, instance) {
        if (!this.closedDate) {
            let params = {
                registerId: this._id
            };
            FlowRouter.go("dental.deposit", params);
        } else {
            swal({
                title: "Warning",
                type: "warning",
                text: "Please , reactive this record before deposit !",
                timer: 1800,
                showConfirmButton: false
            });
        }
    },
    'click .js-quickDeposit' (event, instance) {
        let params = {
            registerId: undefined
        };
        let queryParams = {
            d: 'new',
            quickDeposit: 'new'
        };
        FlowRouter.go("dental.deposit", params, queryParams);
    },
    'click .js-payment' (event, instance) {
        if (this.closedDate) {
            let params = {
                registerId: this._id
            };
            FlowRouter.go("dental.payment", params);
        } else {
            swal({
                title: "Warning",
                type: "warning",
                text: "Please , close this record before payment !",
                timer: 1800,
                showConfirmButton: false
            });
        }
    },
    'click .js-quickPayment' (event, instance) {
        let params = {
            registerId: undefined
        };
        let queryParams = {
            d: 'new',
            quickPayment: 'new'
        };
        FlowRouter.go("dental.payment", params, queryParams);
    },
    'click .js-display' (event, instance) {
        alertify.registerShow(fa('eye', 'Register'), renderTemplate(showTmpl, {
            registerId: this._id
        }));
    },
    'click .js-invoice' (event, instance) {
        let params = {};
        let queryParams = {
            registerId: this._id
        };
        let path = FlowRouter.path("dental.registerInvoiceReportGe", params, queryParams);

        window.open(path, '_blank');
    }
});

let patientDoc = new ReactiveVar();
let patientId = new ReactiveVar();

Tracker.autorun(() => {
    // lookup Patient
    if (patientId.get()) {
        lookupPatient.callPromise({
            patientId: patientId.get()
        }).then((result) => {
            patientDoc.set(result);
        }).catch((err) => {
            console.log(err);
        });
        Session.set('patientVarDoc', patientDoc.get());
    }
});

// Form
formTmpl.onCreated(function () {
    let self = this;
    self.isLoading = new ReactiveVar(false);
    self.registerDoc = new ReactiveVar();

    self.autorun(() => {
        let currentData = Template.currentData();
        if (currentData) {
            self.isLoading.set(true);

            lookupRegister.callPromise({
                registerId: currentData.registerId
            }).then((result) => {
                // Add items to local collection
                _.forEach(result.items, (value) => {
                    registerItemsCollection.insert(value);
                });

                self.registerDoc.set(result);
                self.isLoading.set(false);
            }).catch((err) => {
                console.log(err);
            });
        }
    });

});


formTmpl.helpers({
    collection() {
        return Register;
    },
    isLoading() {
        return Template.instance().isLoading.get();
    },
    data() {
        let registerDoc = Template.instance().registerDoc.get();
        let data = {
            formType: 'insert',
            doc: {}
        };
        let currentData = Template.currentData();
        if (currentData) {
            //set patientId on update form
            let patient = registerDoc.patientId;
            patientId.set(patient);
            Session.set('patientVar', patient);

            data.formType = 'update';
            registerDoc.credit = registerDoc.subTotal - (registerDoc.totalDeposit + registerDoc.totalPaid);
            data.doc = registerDoc;

        }

        return data;
    },
    registerItemsCollection() {
        return registerItemsCollection;
    },
    disabledSubmitBtn: function () {
        let count = registerItemsCollection.find().count();
        if (count == 0) {
            return {
                disabled: true
            };
        }

        return {};
    },
    checkMember() {
        let patient = patientDoc.get();

        let result = {
            class: 'gray',
            labelStatus: "warning",
            text: 'Unknown'
        };

        if (!_.isUndefined(patient) && patient.member == "Yes") {
            result = {
                class: 'green',
                labelStatus: "success",
                text: patient.member
            };
        } else if (!_.isUndefined(patient) && patient.member == "No") {
            result = {
                class: 'red',
                labelStatus: "danger",
                text: patient.member
            };
        }

        return result;
    }
});

statusLinkActionTmpl.helpers({
    status() {
        let result = {
            btnColor: 'success',
            icon: fa("check-square", "Active")
        };
        if (!_.isUndefined(this.closedDate)) {
            result = {
                btnColor: 'danger',
                icon: fa("history", "Closed")
            };
        }

        return result;
    }
});

depositAndPaymentLinkActionTmpl.helpers({
    checkDP() {
        let result;
        if (_.isUndefined(this.closedDate)) {
            result = '';
        }
        return result;
    }
});

statusActionTmpl.helpers({
    collection() {
        return Register;
    },
    data() {
        let data = {
            formType: 'insert',
            doc: {}
        };

        let currentData = Template.currentData();
        if (currentData) {
            //set patientId on update form
            data.formType = 'update';
            data.doc = this;
        }

        return data;
    },
    todayDate() {
        return moment().toDate();
    }
});

formTmpl.events({
    'change [name="patientId"]' (event, instance) {
        let patient = event.currentTarget.value;
        Session.set('patientVar', patient);

        //set patientId on insert form
        patientId.set(patient);

        //animate for member
        $('#animation').removeClass().addClass('animated rotateIn').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
            $(this).removeClass('animated rotateIn');
        });

        // reset items
        $('[name="qty"]').val(0);
        AutoForm.resetForm('Dental_registerItemsNew');
    }
});

formTmpl.onDestroyed(function () {
    // Remove items collection
    registerItemsCollection.remove({});
    Session.set('patientVar');
    Session.set('patientVarDoc');
    Session.set('update', false);
    patientId.set('');
    patientDoc.set('');
});

// Show
showTmpl.onCreated(function () {
    // let self = this;
    this.isLoading = new ReactiveVar(true);
    this.registerDoc = new ReactiveVar();

    this.autorun(() => {
        let currentData = Template.currentData();
        lookupRegister.callPromise({
            registerId: currentData.registerId
        }).then((result) => {
            console.log('result: ', result);

            this.registerDoc.set(result);
            this.isLoading.set(false);
        }).catch((err) => {
            console.log(err);
        });
    });
});

showTmpl.helpers({
    isLoading() {
        return Template.instance().isLoading.get();
    },
    data() {
        let data = Template.instance().registerDoc.get();
        _.forEach(data.items, function (obj) {
            obj.date = moment(obj.date).format('DD/MM/YYYY');
        });

        // Use jsonview
        if (data) {
            data.jsonViewOpts = {
                collapsed: true
            };
        }

        return data;
    }
});

// Hook
let hooksObject = {
    before: {
        insert: function (doc) {
            doc.items = registerItemsCollection.find().fetch();
            return doc;
        },
        update: function (doc) {
            let setActiveDate = Session.get('SetActiveDate');
            if (!setActiveDate) {
                doc.$set.items = registerItemsCollection.find().fetch();
                Session.set('SetActiveDate', null);
            }
            delete doc.$unset;

            return doc;
        }
    },
    onSuccess(formType, result) {
        if (formType == 'update') {
            alertify.register().close();
        }
        // Remove items collection
        registerItemsCollection.remove({});
        $('[name="itemId"]').val(null).trigger('change');
        $('[name="qty"]').val(null);
        $('[name="price"]').val(null);
        $('[name="amount"]').val(null);

        displaySuccess();
    },
    onError(formType, error) {
        displayError(error.message);
    },
    onSuccess(statusActionTmpl, result) {
        if (statusActionTmpl == 'update') {
            alertify.registerClosedDate().close();
        }

        $('[name="closedDate"]').val(null);
        displaySuccess();
    },
    onError(formType, error) {
        displayError(error.message);
    }
};

AutoForm.addHooks(['Dental_registerForm', 'Dental_registerClosedDate'], hooksObject);

//check closed register update & remove hide
function checkClosedRegister(self) {
    if (_.isUndefined(self)) {
        $('.js-update').show();
        $('.js-destroy').show();
    } else {
        $('.js-update').hide();
        $('.js-destroy').hide();
    }
}