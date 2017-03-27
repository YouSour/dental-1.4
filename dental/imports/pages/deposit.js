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
import {lookupDeposit} from '../../common/methods/lookup-deposit';

// Collection
import {Register} from '../../common/collections/register.js';
import {Deposit} from '../../common/collections/deposit.js';

// Tabular
import {DepositTabular} from '../../common/tabulars/deposit.js';

// Page
import './deposit.html';
import './deposit-items.js';
import './register.js';

// Local collection
let depositItemsCollection = new Mongo.Collection(null);

// Declare template
let indexTmpl = Template.Dental_deposit,
    itemsTmpl = Template.Dental_depositItem,
    formTmpl = Template.Dental_depositForm,
    editTmpl = Template.Dental_depositEditForm,
    showTmpl = Template.Dental_depositShow;

// reactiveVar
let depositDoc = new ReactiveVar();

Tracker.autorun(()=> {
    let registerId = FlowRouter.getParam("registerId");
    let newDeposit = FlowRouter.query.get('d');

    if (registerId && _.isUndefined(newDeposit)) {
        lookupDeposit.callPromise({
            registerId: registerId
        }).then((result)=> {
            depositDoc.set(result);
        }).catch((err)=> {
            console.log(err);
        });
    }

});

// Index
indexTmpl.onCreated(function () {
    // Create new  alertify
    createNewAlertify('deposit', {size: 'lg'});
    createNewAlertify('depositShow', {size: 'lg'});

    //Deposit
    this.subscribe('dental.deposit');
    this.subscribe('dental.register');
});

indexTmpl.helpers({
    tabularTable(){
        return DepositTabular;
    },
    selector() {
        return {branchId: Session.get('currentByBranch'), registerId: FlowRouter.getParam("registerId")};
    },
    depositData(){
        let registerCollection = Register.find();
        let depositCollection = Deposit.find();
        let totalAmount = 0, totalDeposit = 0, totalBalance = 0, statusClosedCount = 0, statusActiveCount = 0;

        registerCollection.forEach(function (obj) {
            totalAmount += obj.total;

            if (!_.isUndefined(obj.closedDate)) {
                statusClosedCount += 1;
            } else {
                statusActiveCount += 1;
            }
        });

        depositCollection.forEach(function (obj) {
            totalDeposit += obj.amount;
        });

        totalBalance = totalAmount - totalDeposit;

        let data = {
            depositCount: Deposit.find().count(),
            totalAmount: totalAmount,
            totalDeposit: totalDeposit,
            totalBalance: totalBalance,
            statusActiveCount: statusActiveCount,
            statusClosedCount: statusClosedCount
        };

        return data;
    },
    checkQuickDeposit () {
        if (FlowRouter.query.get('quickDeposit') == undefined) {
            return true;
        }
    }
});

indexTmpl.events({
    'click .js-create' (event, instance) {
        FlowRouter.query.set({d: 'new'});
        alertify.deposit(fa('plus', 'Deposit'), renderTemplate(formTmpl)).maximize();
    },
    'click .js-update' (event, instance) {
        if (lastDeposit(this._id, this.registerId)) {
            let dataUpdate = this;
            alertify.deposit(fa('pencil', 'Deposit'), renderTemplate(editTmpl, dataUpdate));
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
        if (lastDeposit(this._id, this.registerId)) {
            destroyAction(
                Deposit,
                {_id: this._id},
                {title: 'Deposit', itemTitle: this._id}
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
        alertify.depositShow(fa('eye', 'Deposit'), renderTemplate(showTmpl, {depositId: this._id}));
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

    self.depositDoc = new ReactiveVar();
    // let registerId = FlowRouter.getParam("registerId");
    let newDeposit = FlowRouter.query.get('d');
    let uponSave = FlowRouter.query.get('sid');

    self.autorun(()=> {
        let registerId = FlowRouter.getParam("registerId") || Session.get('registerId');

        if (registerId && newDeposit == 'new' || uponSave) {
            lookupDeposit.callPromise({
                registerId: registerId
            }).then((result)=> {
                self.depositDoc.set(result);
            }).catch((err)=> {
                console.log(err);
            });
        }

    });

});

formTmpl.helpers({
    collection(){
        return Deposit;
    },
    depositItemsCollection(){
        return depositItemsCollection;
    },
    data () {
        let depositDoc = Template.instance().depositDoc.get();

        if (depositDoc) {
            if (_.isNull(depositDoc.closedDate)) {
                let data = {
                    formType: 'insert',
                    doc: {
                        registerId: _.isEmpty(this) ? depositDoc._id : depositDoc.registerId,
                        patientId: depositDoc.patientId,
                        paidDate: moment().toDate(),
                        amount: !_.isUndefined(depositDoc.deposit.total) ? depositDoc.deposit.total : depositDoc.deposit.totalBalance
                    }
                };
                data.date = moment().toDate();
                let currentData = Template.currentData();

                if (!_.isEmpty(currentData)) {
                    data.formType = 'update';
                    depositDoc.deposit.items = currentData.items;
                }
                depositItemsCollection.remove({});
                depositDoc.deposit.items.forEach(function (item) {
                    if (item.tempBalance && item.tempBalance > 0 && item.status == "permission") {
                        if (_.isUndefined(depositDoc.deposit.depositCount)) {
                            item.amount = item.tempBalance;
                            item.paidAmount = item.amount;
                            item.balance = 0;
                            item.labo = item.labo;
                            item.doctor = item.doctor;
                        }
                        depositItemsCollection.insert(item);
                    } else if (!_.isUndefined(item.date)) {

                        item.paidAmount = item.amount;
                        item.balance = 0;
                        depositItemsCollection.insert(item);
                    }
                });
                $('button[type=submit]').removeAttr('disabled');
                return data;
            } else {
                swal({
                    title: "Warning",
                    type: "warning",
                    text: "Please , reactive this record before deposit !",
                    timer: 1800,
                    showConfirmButton: false
                });

                $('button[type=submit]').attr('disabled', 'true');
            }
        }
    },
    checkQuickDeposit () {
        if (FlowRouter.query.get('quickDeposit') == 'new') {
            return true;
        }
    },
    disabledSubmitBtn (){
        let amount = Session.get('amount');
        let paidAmount = Session.get('paidAmount');

        if (amount >= paidAmount) {
            return {};
        }

        if (!_.isUndefined(amount)) {
            swal({
                title: "Warning",
                type: "warning",
                text: "Paid can\'t greater than Amount !",
                timer: 1500,
                showConfirmButton: false
            });
            return {disabled: true};
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

            depositItemsCollection.update(
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
            depositItemsCollection.find().forEach(function (obj) {
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
        return Deposit;
    },
    depositItemsCollection(){
        return depositItemsCollection;
    },
    data () {
        let currentData = Template.currentData();


        let data = {
            doc: currentData
        };
        if (currentData) {
            var items = currentData.items;
            depositItemsCollection.remove({});
            items.forEach(function (item) {
                depositItemsCollection.insert(item);
            });
        }

        return data;
    },
    checkQuickDeposit () {
        if (FlowRouter.query.get('quickDeposit') == 'new') {
            return true;
        }
    },
    disabledSubmitBtn (){
        let amount = Session.get('amount');
        let paidAmount = Session.get('paidAmount');

        if (amount >= paidAmount) {
            return {};
        }

        if (!_.isUndefined(amount)) {
            swal({
                title: "Warning",
                type: "warning",
                text: "Paid can\'t greater than Amount !",
                timer: 1500,
                showConfirmButton: false
            });
            return {disabled: true};

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

            depositItemsCollection.update(
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
    depositItemsCollection.remove({});
    Session.set('edit', undefined);
    Session.set('patientId', '');
    Session.set('registerId', '');
    FlowRouter.query.set({d: undefined, sid: undefined});
});

// Show
showTmpl.onCreated(function () {
    this.autorun(()=> {
        let currentData = Template.currentData();
        this.subscribe('dental.depositById', currentData.depositId);
    });
});

showTmpl.helpers({
    data () {
        let currentData = Template.currentData();
        let data = Deposit.findOne(currentData.depositId);
        data.totalAmount = data.amount + data.totalBalance;
        return data;
    }
});

// Hook
let hooksObject = {
    before: {
        insert: function (doc) {
            let items = depositItemsCollection.find().fetch();
            items.forEach(function (item) {
                item.status = item.balance > 0 ? "permission" : "ban"
            });

            doc.items = items;
            return doc;
        },
        update: function (doc) {
            let items = depositItemsCollection.find().fetch();
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
        depositItemsCollection.remove({});
        displaySuccess();
        alertify.deposit().close();

    },
    onError (formType, error) {
        displayError(error.message);
    }
};

AutoForm.addHooks(['Dental_depositForm', 'Dental_depositEditForm'], hooksObject);

function lastDeposit(id, registerId) {
    let lastDepositDoc = Deposit.findOne({registerId: registerId}, {sort: {_id: -1}});
    if (lastDepositDoc._id == id) {
        return true;
    }
}