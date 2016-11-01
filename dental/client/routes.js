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
import '../../core/imports/layouts/login';
import '../../core/imports/layouts/main';

// Group
let DentalRoutes = FlowRouter.group({
    prefix: '/dental',
    title: "Dental",
    titlePrefix: 'Dental > ',
    subscriptions: function (params, queryParams) {
//     this.register('files', Meteor.subscribe('files'));
    }
});

// Home
import '../imports/pages/home.js';
DentalRoutes.route('/home', {
    name: 'dental.home',
    title: __('dental.home.title'),
    action(param, queryParam){
        Layout.main('Dental_home');
    },
    breadcrumb: {
        //params: ['id'],
        //queryParams: ['show', 'color'],
        title: __('dental.home.title'),
        icon: 'home',
        parent: 'core.welcome'
    }
});

// Lookup Value
import '../imports/pages/lookup-value.js';
DentalRoutes.route('/lookup-value', {
    name: 'dental.lookupValue',
    title: 'Lookup Value',
    action: function (params, queryParams) {
        Layout.main('Dental_lookupValue');
    },
    breadcrumb: {
        //params: ['id'],
        //queryParams: ['show', 'color'],
        title: 'Lookup Value',
        // icon: 'asterisk',
        parent: 'dental.home'
    }
});

// Item
import '../imports/pages/item.js';
DentalRoutes.route('/item', {
    name: 'dental.item',
    title: __('dental.item.title'),
    action: function (params, queryParams) {
        Layout.main('Dental_item');
    },
    breadcrumb: {
        //params: ['id'],
        //queryParams: ['show', 'color'],
        title: __('dental.item.title'),
        // icon: 'product-hunt',
        parent: 'dental.home'
    }
});

// Customer
import '../imports/pages/customer.js';
DentalRoutes.route('/customer', {
    name: 'dental.customer',
    title: 'Customer',
    action: function (params, queryParams) {
        Layout.main('Dental_customer');
    },
    breadcrumb: {
        //params: ['id'],
        //queryParams: ['show', 'color'],
        title: 'Customer',
        // icon: 'users',
        parent: 'dental.home'
    }
});

// Patient
import '../imports/pages/patient.js';
DentalRoutes.route('/patient', {
    name: 'dental.patient',
    title: 'Patient',
    action: function (params, queryParams) {
        Layout.main('Dental_patient');
    },
    breadcrumb: {
        //params: ['id'],
        //queryParams: ['show', 'color'],
        title: 'Patient',
        // icon: 'users',
        parent: 'dental.home'
    }
});

//Staff
import '../imports/pages/staff.js';
DentalRoutes.route('/staff',{
   name:'dental.staff',
    title:'Staff',
    action:function (params, queryParams) {
        Layout.main('Dental_staff');
    },
    breadcrumb:{
        title:'Staff',
        parent:'dental.staff'
    }
});

//Doctor
import '../imports/pages/doctor.js';
DentalRoutes.route('/doctor',{
    name:'dental.doctor',
    title:'Doctor',
    action:function (params, queryParams) {
        Layout.main('Dental_doctor');
    },
    breadcrumb:{
        title:'Doctor',
        parent:'dental.doctor'
    }
});

//Case History
import '../imports/pages/case-history.js';
DentalRoutes.route('/case-history',{
    name:'dental.caseHistory',
    title:'Case History',
    action:function (params, queryParams) {
        Layout.main('Dental_caseHistory');
    },
    breadcrumb:{
        title:'Case History',
        parent:'dental.caseHistory'
    }
});

// Disease Categories
import '../imports/pages/disease-categories.js';
DentalRoutes.route('/disease-categories', {
    name: 'dental.diseaseCategories',
    title: 'Disease Categories',
    action: function (params, queryParams) {
        Layout.main('Dental_diseaseCategories');
    },
    breadcrumb: {
        //params: ['id'],
        //queryParams: ['show', 'color'],
        title: 'Disease Categories',
        // icon: 'asterisk',
        parent: 'dental.home'
    }
});

// Disease Items
import '../imports/pages/disease-items.js';
DentalRoutes.route('/disease-items', {
    name: 'dental.diseaseItems',
    title: 'Disease Items',
    action: function (params, queryParams) {
        Layout.main('Dental_diseaseItems');
    },
    breadcrumb: {
        //params: ['id'],
        //queryParams: ['show', 'color'],
        title: 'Disease Items',
        // icon: 'asterisk',
        parent: 'dental.home'
    }
});

// Laboratory Items
import '../imports/pages/laboratory-items.js';
DentalRoutes.route('/laboratory-items', {
    name: 'dental.laboratoryItems',
    title: 'Laboratory Items',
    action: function (params, queryParams) {
        Layout.main('Dental_laboratoryItems');
    },
    breadcrumb: {
        //params: ['id'],
        //queryParams: ['show', 'color'],
        title: 'Laboratory Items',
        // icon: 'asterisk',
        parent: 'dental.home'
    }
});

// Order
import '../imports/pages/order.js';
DentalRoutes.route('/order', {
    name: 'dental.order',
    title: 'Order',
    action: function (params, queryParams) {
        Layout.main('Dental_order');
    },
    breadcrumb: {
        //params: ['id'],
        //queryParams: ['show', 'color'],
        title: 'Order',
        // icon: 'cart-plus',
        parent: 'dental.home'
    }
});

// Register
import '../imports/pages/register.js';
DentalRoutes.route('/register', {
    name: 'dental.register',
    title: 'Register',
    action: function (params, queryParams) {
        Layout.main('Dental_register');
    },
    breadcrumb: {
        //params: ['id'],
        //queryParams: ['show', 'color'],
        title: 'Register',
        icon: 'file-text',
        parent: 'dental.home'
    }
});

// Deposit
import '../imports/pages/deposit.js';
DentalRoutes.route('/deposit/:registerId?', {
    name: 'dental.deposit',
    title: 'Deposit',
    action: function (params, queryParams) {
        Layout.main('Dental_deposit');
    },
    breadcrumb: {
        //params: ['id'],
        //queryParams: ['show', 'color'],
        title: 'Deposit',
        icon: 'tags',
        parent: 'dental.register'
    }
});

//Payment
import '../imports/pages/payment.js';
DentalRoutes.route('/payment/:registerId?', {
    name: 'dental.payment',
    title: 'Payment',
    action: function (params, queryParams) {
        Layout.main('Dental_payment');
    },
    breadcrumb: {
        //params: ['id'],
        //queryParams: ['show', 'color'],
        title: 'Payment',
        // icon: 'tags',
        parent: 'dental.register'
    }
});
