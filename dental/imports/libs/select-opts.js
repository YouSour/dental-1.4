import {Meteor} from  'meteor/meteor';
import {_} from 'meteor/erasaur:meteor-lodash';

// Collection
import {LookupValue} from '../../common/collections/lookup-value';
import {Branch} from '../../../core/common/collections/branch.js';
import {CaseHistory} from '../../common/collections/case-history.js';
import {DiseaseCategories} from '../../common/collections/disease-categories.js';
import {Register} from '../../common/collections/register.js';

export const SelectOpts = {
    branch: function (selectOne) {
        let list = [];
        if (selectOne) {
            list.push({label: "(Select One)", value: ""});
        }

        Branch.find()
            .forEach(function (obj) {
                list.push({label: obj.enName, value: obj._id});
            });

        return list;
    },
    gender: function (selectOne) {
        let list = [];
        if (selectOne) {
            list.push({label: "(Select One)", value: ""});
        }
        list.push({label: "Male", value: "M"});
        list.push({label: "Female", value: "F"});

        return list;
    },
    caseHistory: function (selectOne) {
        let list = [];
        if (selectOne) {
            list.push({label: "(Select One)", value: ""});
        }

        CaseHistory.find()
            .forEach(function (obj) {
                list.push({label: obj.name, value: obj._id});
            });

        return list;
    },
    diseaseCategories: function (selectOne) {
        let list = [];
        if (selectOne) {
            list.push({label: "(Select One)", value: ""});
        }

        DiseaseCategories.find()
            .forEach(function (obj) {
                list.push({label: obj._id + " : " + obj.name, value: obj._id});
            });

        return list;
    },
    register: function (selectOne) {
        let list = [];
        let registerId = FlowRouter.getParam("registerId");
        let patientId = Session.get('patientId');
        if (selectOne) {
            list.push({label: "(Select One)", value: ""});
        }

        Register.find({$or: [{patientId: patientId}, {_id: registerId}]})
            .forEach(function (obj) {
                list.push({label: obj._id, value: obj._id});
            });

        return list;
    }
};