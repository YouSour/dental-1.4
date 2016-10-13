import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {FlowRouterTitle} from 'meteor/ostrio:flow-router-title';
import 'meteor/arillo:flow-router-helpers';
import 'meteor/zimme:active-route';
import 'meteor/theara:flow-router-breadcrumb';

// Lib
import {__} from '../../core/common/libs/tapi18n-callback-helper.js';

// Layout
import {Layout} from '../../core/client/libs/render-layout.js';
import '../../core/imports/layouts/report/index.html';

// Group
let DentalRoutes = FlowRouter.group({
    prefix: '/dental',
    title: "Dental",
    titlePrefix: 'Dental > ',
    subscriptions: function (params, queryParams) {
        // Branch by user
        if (Meteor.user()) {
            let rolesBranch = Meteor.user().rolesBranch;
            this.register('core.branch', Meteor.subscribe('core.branch', {_id: {$in: rolesBranch}}));
        }
    }
});

// Invoice
import '../imports/reports/invoice.js';
DentalRoutes.route('/invoice-report', {
    name: 'dental.invoiceReport',
    title: 'Invoice Report',
    action: function (params, queryParams) {
        Layout.main('Dental_invoiceReport');
    },
    breadcrumb: {
        //params: ['id'],
        //queryParams: ['show', 'color'],
        title: 'Invoice Report',
        // icon: 'cart-plus',
        parent: 'dental.home'
    }
});
DentalRoutes.route('/invoice-report-gen', {
    name: 'dental.invoiceReportGe',
    title: 'Invoice Report',
    action: function (params, queryParams) {
        Layout.report('Dental_invoiceReportGen');
    }
});

// Order
import '../imports/reports/order.js';
DentalRoutes.route('/order-report', {
    name: 'dental.orderReport',
    title: 'Order Report',
    action: function (params, queryParams) {
        Layout.main('Dental_orderReport');
    },
    breadcrumb: {
        //params: ['id'],
        //queryParams: ['show', 'color'],
        title: 'Order Report',
        // icon: 'users',
        parent: 'dental.home'
    }
});

// Register Invoice
import '../imports/reports/register-invoice.js';
DentalRoutes.route('/register-invoice-report', {
    name: 'dental.registerInvoiceReport',
    title: 'Register Invoice Report',
    action: function (params, queryParams) {
        Layout.main('Dental_registerInvoiceReport');
    },
    breadcrumb: {
        //params: ['id'],
        //queryParams: ['show', 'color'],
        title: 'Register Invoice Report',
        // icon: 'cart-plus',
        parent: 'dental.home'
    }
});
DentalRoutes.route('/register-invoice-report-gen', {
    name: 'dental.registerInvoiceReportGe',
    title: 'Register Invoice Report',
    action: function (params, queryParams) {
        Layout.report('Dental_registerInvoiceReportGen');
    }
});