import * as mongoose from 'mongoose';
import {conf} from '../bootstrap';

import {IRelationshipType, RelationshipTypeModel} from '../models/relationshipType.model';

var now = new Date();

// seeder .............................................................................................................

class Seeder {

    public static async connect() {
        await mongoose.connect(conf.mongoURL);
        console.log('Connected to the db: ', conf.mongoURL);
    }

    public static async dropDatabase() {
        if (conf.devMode) {
            console.info('Dropping database in dev mode (starting fresh)');
            await mongoose.connection.db.dropDatabase();
        }
        else {
            console.info('Not dropping database in prod mode (appending)');
        }
    }

    public static async disconnect() {
        mongoose.connection.close();
    }

    public static async createRelationshipTypeModel(values: Object) {
        console.log('inserting createRelationshipTypeModel ... ');
        const model = await RelationshipTypeModel.create(values);
        console.log(model);
        return model;
    }

}

// load reference data ................................................................................................

const loadRelationshipTypes = async () => {

    //'Business Representative',
    //'Online Service Provider',
    //'Insolvency practitioner',
    //'Trusted Intermediary - tax agent, BAS Agent, Financial Advisor, Lawyer',
    //'Intermediary – Real Estate Agent, Immigration Agent',
    //'Importer Export Agent',
    //'Doctor Patient',
    //'Nominated Entity',
    //'Power of Attorney (Voluntary)',
    //'Power of Attorney (Involuntary)',
    //'Executor of deceased estate',
    //'Pharmaceutical',
    //'Institution to student – relationship',
    //'Training organisations (RTO)',
    //'Parent - Child',
    //'Employment Agents – employment'

    await Seeder.createRelationshipTypeModel({
        code: 'BUSINESS_REPRESENTATIVE',
        shortDecodeText: 'Business Representative',
        longDecodeText: 'Business Representative',
        startDate: now
    });

    await Seeder.createRelationshipTypeModel({
        code: 'ONLINE_SERVICE_PROVIDER',
        shortDecodeText: 'Online Service Provider',
        longDecodeText: 'Online Service Provider',
        startDate: now
    });

};

// load sample data ...................................................................................................


// rock and roll ......................................................................................................

Seeder
    .connect()
    .then(Seeder.dropDatabase)
    .then(loadRelationshipTypes)
    .then(Seeder.disconnect);