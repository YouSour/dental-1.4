import {Meteor} from 'meteor/meteor';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {ReactiveTable} from 'meteor/aslagle:reactive-table';

// Collection
import {DiseaseCategories} from '../../common/collections/disease-categories.js';

Meteor.publish('dental.diseaseCategories', function simpleDiseaseCategories() {
    this.unblock();

    if (!this.userId) {
        return this.ready();
    }

    return DiseaseCategories.find();
});