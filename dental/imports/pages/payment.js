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

// Method
import {lookupRegister} from '../../common/methods/lookup-register';
import {lookupPayment} from '../../common/methods/lookup-payment';

// Collection
import {Register} from '../../common/collections/register.js';
import {Deposit} from '../../common/collections/deposit.js';
import {Payment} from '../../common/collections/payment.js';

// Tabular
import {PaymentTabular} from '../../common/tabulars/payment.js';

// Page
import './payment.html';
import './payment-items.js';
import './register.js';

// Local collection
let paymentItemsCollection = new Mongo.Collection(null);

// Declare template
let indexTmpl = Template.Dental_payment,
    itemsTmpl = Template.Dental_paymentItem,
    formTmpl = Template.Dental_paymentForm,
    editTmpl = Template.Dental_paymentEditForm,
    showTmpl = Template.Dental_paymentShow;

// reactiveVar
let paymentDoc = new ReactiveVar();

Tracker.autorun(()=> {
    let registerId = FlowRouter.getParam("registerId");
    let newPayment = FlowRouter.query.get('d');

    if (registerId && _.isUndefined(newPayment)) {
        lookupPayment.callPromise({
            registerId: registerId
        }).then((result)=> {
            paymentDoc.set(result);
        }).catch((err)=> {
            console.log(err);
        });
    }

});

// Index
indexTmpl.onCreated(function () {
    // Create new  alertify
    createNewAlertify('payment', {size: 'lg'});
    createNewAlertify('paymentShow', {size: 'lg'});

    //Payment
    this.subscribe('dental.payment');
    this.subscribe('dental.deposit');
    this.subscribe('dental.register');
});

indexTmpl.helpers({
    tabularTable(){
        return PaymentTabular;
    },
    selector() {
        return {branchId: Session.get('currentByBranch'), registerId: FlowRouter.getParam("registerId")};
    },
    paymentData(){
        let registerCollection = Register.find();
        let depositCollection = Deposit.find();
        let paymentCollection = Payment.find();

        let totalAmount = 0, totalPayment = 0, totalBalance = 0, totalDeposit = 0, statusClosedCount = 0, statusActiveCount = 0;

        depositCollection.forEach(function (obj) {
            totalDeposit += obj.amount;
        });

        registerCollection.forEach(function (obj) {
            totalAmount += obj.total;
            if (!_.isUndefined(obj.closedDate)) {
                statusClosedCount += 1;
            } else {
                statusActiveCount += 1;
            }
        });

        paymentCollection.forEach(function (obj) {
            totalPayment += obj.amount;
        });

        totalBalance = (totalAmount - totalDeposit) - totalPayment;

        let data = {
            paymentCount: Payment.find().count(),
            totalAmount: totalAmount,
            totalDeposit: totalDeposit,
            totalPayment: totalPayment,
            totalBalance: totalBalance,
            statusActiveCount: statusActiveCount,
            statusClosedCount: statusClosedCount
        };

        return data;
    },
    checkQuickPayment () {
        if (FlowRouter.query.get('quickPayment') == undefined) {
            return true;
        }
    }
});

indexTmpl.events({
    'click .js-create' (event, instance) {
        FlowRouter.query.set({d: 'new'});
        alertify.payment(fa('plus', 'Payment'), renderTemplate(formTmpl)).maximize();
    },
    'click .js-update' (event, instance) {

        if (lastPayment(this._id, this.registerId)) {
            let dataUpdate = this;
            alertify.payment(fa('pencil', 'Payment'), renderTemplate(editTmpl, dataUpdate)).maximize();
        } else {
            swal({
                title: "Warning",
                type: "warning",
                text: "You can edit the last record only !",
                timer: 1800,
                showConfirmButton: false
            });
        }
    },
    'click .js-destroy' (event, instance) {
        if (lastPayment(this._id, this.registerId)) {
            destroyAction(
                Payment,
                {_id: this._id},
                {title: 'Payment', itemTitle: this._id}
            );
        } else {
            swal({
                title: "Warning",
                type: "warning",
                text: "You can delete the last record only !",
                timer: 1800,
                showConfirmButton: false
            });
        }
    },
    'click .js-display' (event, instance) {
        alertify.paymentShow(fa('eye', 'Payment'), renderTemplate(showTmpl, {paymentId: this._id}));
    }
});

// items tabular
itemsTmpl.helpers({
    jsonViewOpts () {
        return {collapsed: true};
    }
});

// Form
formTmpl.onCreated(function () {
    let self = this;
    self.paymentDoc = new ReactiveVar();
    let newPayment = FlowRouter.query.get('d');
    let uponSave = FlowRouter.query.get('sid');

    self.autorun(()=> {
        let registerId = FlowRouter.getParam("registerId") || Session.get('registerId');

        if (registerId && newPayment == 'new' || uponSave) {
            lookupPayment.callPromise({
                registerId: registerId
            }).then((result)=> {
                self.paymentDoc.set(result);
            }).catch((err)=> {
                console.log(err);
            });
        }

    });

});

formTmpl.helpers({
    collection(){
        return Payment;
    },
    paymentItemsCollection(){
        return paymentItemsCollection;
    },
    data () {
        let paymentDoc = Template.instance().paymentDoc.get();
        if (paymentDoc) {
            if (!_.isNull(paymentDoc.closedDate)) {
                let data = {
                    formType: 'insert',
                    doc: {
                        registerId: _.isEmpty(this) ? paymentDoc._id : paymentDoc.registerId,
                        patientId: paymentDoc.patientId,
                        paidDate: moment().toDate(),
                        amount: !_.isUndefined(paymentDoc.payment.total) ? paymentDoc.payment.total : paymentDoc.payment.totalBalance
                    }
                };
                data.date = moment().toDate();
                let currentData = Template.currentData();

                if (!_.isEmpty(currentData)) {
                    data.formType = 'update';
                    paymentDoc.payment.items = currentData.items;
                }
                paymentItemsCollection.remove({});
                paymentDoc.payment.items.forEach(function (item) {
                    if (item.tempBalance && item.tempBalance > 0 && item.status == "permission") {
                        if (_.isUndefined(paymentDoc.payment.paymentCount)) {
                            item.amount = item.tempBalance;
                            item.paidAmount = item.amount;
                            item.balance = 0;
                        }
                        paymentItemsCollection.insert(item);
                    } else if (!_.isUndefined(item.date)) {

                        item.paidAmount = item.amount;
                        item.balance = 0;
                        paymentItemsCollection.insert(item);
                    }
                });
                $('button[type=submit]').removeAttr('disabled');
                return data;
            } else {
                swal({
                    title: "Warning",
                    type: "warning",
                    text: "Please , close this record before payment !",
                    timer: 1800,
                    showConfirmButton: false
                });
                $('button[type=submit]').attr('disabled', 'true');
            }
        }
    },
    checkQuickPayment () {
        if (FlowRouter.query.get('quickPayment') == 'new') {
            return true;
        }
    }
});

formTmpl.events({
    'keyup [name="amount"]': function (event, instance) {
        let totalAmount = event.currentTarget.value;

        $('tr').each(function () {
            let $parents = $(this).closest('tr');
            let amount = $parents.children('td.amount').text();
            amount = _.isEmpty(amount) ? 0 : parseFloat(amount);
            let itemId = $parents.children('td.itemId').text();

            let paidAmount = 0, balance, tempCondition = 0;
            tempCondition = totalAmount - amount;

            if (totalAmount > 0 && tempCondition >= 0) {
                paidAmount = amount;
                balance = 0;
                totalAmount = tempCondition;
            }
            else if (totalAmount > 0 && tempCondition < 0) {
                paidAmount = totalAmount;
                balance = totalAmount = tempCondition;
                balance = Math.abs(balance);
            } else {
                paidAmount = 0;
                balance = amount;
            }

            paymentItemsCollection.update(
                {itemId: itemId},
                {
                    $set: {
                        paidAmount: paidAmount,
                        tempBalance: balance,
                        balance: balance,
                        status: balance > 0 ? "permission" : "ban"
                    }
                }
            );

            //totalBalance
            totalBalance = 0;
            paymentItemsCollection.find().forEach(function (obj) {
                totalBalance += obj.balance;
            });
            $('[name="totalBalance"]').val(totalBalance);

        });
    },
    'change [name="patientId"]': function (event, instance) {
        let patient = event.currentTarget.value;
        Session.set('patientId', patient);

        //clear register
        $('[name="registerId"]').val('');
    },
    'change [name="registerId"]': function (event, instance) {
        let register = event.currentTarget.value;
        Session.set('registerId', register);
    }
});

editTmpl.helpers({
    collection(){
        return Payment;
    },
    paymentItemsCollection(){
        return paymentItemsCollection;
    },
    data () {
        let currentData = Template.currentData();
        let data = {
            doc: currentData
        };
        if (currentData) {
            var items = currentData.items;
            paymentItemsCollection.remove({});
            items.forEach(function (item) {
                paymentItemsCollection.insert(item);
            });
        }

        return data;
    },
    checkQuickPayment () {
        if (FlowRouter.query.get('quickPayment') == 'new') {
            return true;
        }
    }
});

editTmpl.events({
    'keyup [name="amount"]': function (event, instance) {
        let totalAmount = event.currentTarget.value;

        $('tr').each(function () {
            let $parents = $(this).closest('tr');
            let amount = $parents.children('td.amount').text();
            amount = _.isEmpty(amount) ? 0 : parseFloat(amount);
            let itemId = $parents.children('td.itemId').text();

            let paidAmount = 0, balance, tempCondition = 0;
            tempCondition = totalAmount - amount;

            if (totalAmount > 0 && tempCondition >= 0) {
                paidAmount = amount;
                balance = 0;
                totalAmount = tempCondition;
            }
            else if (totalAmount > 0 && tempCondition < 0) {
                paidAmount = totalAmount;
                balance = totalAmount = tempCondition;
                balance = Math.abs(balance);
            } else {
                paidAmount = 0;
                balance = amount;
            }

            paymentItemsCollection.update(
                {itemId: itemId},
                {
                    $set: {
                        paidAmount: paidAmount,
                        tempBalance: balance,
                        balance: balance,
                        status: balance > 0 ? "permission" : "ban"
                    }
                }
            );
        });
    }
});

formTmpl.onDestroyed(function () {
    // Remove items collection
    paymentItemsCollection.remove({});
    Session.set('edit', undefined);
    Session.set('patientId', '');
    Session.set('registerId', '');
    FlowRouter.query.set({d: undefined, sid: undefined});
});

// Show
showTmpl.onCreated(function () {
    this.autorun(()=> {
        let currentData = Template.currentData();
        this.subscribe('dental.paymentById', currentData.paymentId);
    });
});

showTmpl.helpers({
    data () {
        let currentData = Template.currentData();
        let data = Payment.findOne(currentData.paymentId);
        data.totalAmount = data.amount + data.totalBalance;
        return data;
    }
});

// Hook
let hooksObject = {
    before: {
        insert: function (doc) {
            let items = paymentItemsCollection.find().fetch();
            items.forEach(function (item) {
                item.status = item.balance > 0 ? "permission" : "ban"
            });

            doc.items = items;
            return doc;
        },
        update: function (doc) {
            let items = paymentItemsCollection.find().fetch();
            items.forEach(function (item) {
                item.status = item.balance > 0 ? "permission" : "ban"
            });
            doc.$set.items = items;
            delete doc.$unset;
            return doc;
        }
    },
    onSuccess (formType, result) {
        // Remove items collection
        paymentItemsCollection.remove({});
        displaySuccess();
        alertify.payment().close();

    },
    onError (formType, error) {
        displayError(error.message);
    }
};

AutoForm.addHooks(['Dental_paymentForm', 'Dental_paymentEditForm'], hooksObject);

function lastPayment(id, registerId) {
    let lastPaymentDoc = Payment.findOne({registerId: registerId}, {sort: {_id: -1}});
    if (lastPaymentDoc._id == id) {
        return true;
    }
}