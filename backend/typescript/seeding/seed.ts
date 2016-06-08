import * as mongoose from 'mongoose';
import * as colors from 'colors';
import {conf} from '../bootstrap';

import {
    IRelationshipAttributeName,
    RelationshipAttributeNameModel,
    RelationshipAttributeNameDomain,
    RelationshipAttributeNameClassifier} from '../models/relationshipAttributeName.model';

import {
    IRelationshipAttributeNameUsage,
    RelationshipAttributeNameUsageModel} from '../models/relationshipAttributeNameUsage.model';

import {
    IRelationshipType,
    RelationshipTypeModel} from '../models/relationshipType.model';

import {
    ISharedSecretType,
    SharedSecretTypeModel} from '../models/sharedSecretType.model';

import {
    ISharedSecret,
    SharedSecretModel} from '../models/sharedSecret.model';

import {
    IName,
    NameModel} from '../models/name.model';

import {
    IProfile,
    ProfileModel,
    ProfileProvider} from '../models/profile.model';

import {
    IParty,
    PartyModel,
    PartyType} from '../models/party.model';

import {
    IRelationship,
    RelationshipModel,
    RelationshipStatus} from '../models/relationship.model';

import {
    IIdentity,
    IdentityModel,
    IdentityType,
    IdentityLinkIdScheme,
    IdentityPublicIdentifierScheme} from '../models/identity.model';

const now = new Date();

const truncateString = (input:String):String => {
    return input && input.length > 20 ? (input.substring(0, 20) + '...') : input;
};

// seeder .............................................................................................................

class Seeder {

    public static permissionCustomisationAllowedInd_attributeName:IRelationshipAttributeName;
    public static delegateManageAuthorisationAllowedInd_attributeName:IRelationshipAttributeName;
    public static delegateRelationshipTypeDeclaration_attributeName:IRelationshipAttributeName;
    public static subjectRelationshipTypeDeclaration_attributeName:IRelationshipAttributeName;

    public static asic_abn_attributeName:IRelationshipAttributeName;
    public static wgea_activate_attributeName:IRelationshipAttributeName;
    public static deptindustry_aba_attributeName:IRelationshipAttributeName;
    public static abr_abr_attributeName:IRelationshipAttributeName;
    public static deptindustry_ats_attributeName:IRelationshipAttributeName;
    public static ntdeptbusiness_avetmiss_attributeName:IRelationshipAttributeName;
    public static ntdeptcorpinfoservices_ims_attributeName:IRelationshipAttributeName;
    public static depthscentrelink_ppl_attributeName:IRelationshipAttributeName;
    public static deptimm_skillselect_attributeName:IRelationshipAttributeName;
    public static deptemp_wageconnect_attributeName:IRelationshipAttributeName;

    public static full_accessLevel = 'Full access';
    public static accessLevels = [Seeder.full_accessLevel, 'Limited access', 'No access'];

    public static universal_delegate_relationshipType:IRelationshipType;
    public static custom_delegate_relationshipType:IRelationshipType;

    public static dob_sharedSecretType:ISharedSecretType;

    public static jennifermaxims_name:IName;
    public static jennifermaxims_dob:ISharedSecret;
    public static jennifermaxims_profile:IProfile;
    public static jennifermaxims_party:IParty;
    public static jennifermaxims_identity_1:IIdentity;

    public static jenscatering_name:IName;
    public static jenscatering_profile:IProfile;
    public static jenscatering_party:IParty;
    public static jenscatering_identity_1:IIdentity;

    public static j_and_j_relationship:IRelationship;

    public static async connect() {
        await mongoose.connect(conf.mongoURL);
        console.log(`\nConnected to the db: ${conf.mongoURL}`);
    }

    public static async dropDatabase() {
        if (conf.devMode) {
            console.log('Dropping database in dev mode (starting fresh)');
            await mongoose.connection.db.dropDatabase();
        } else {
            console.log('Not dropping database in prod mode (appending)');
        }
    }

    public static async disconnect() {
        mongoose.connection.close();
    }

    public static async createRelationshipAttributeNameModel(values:IRelationshipAttributeName) {
        const code = values.code;
        const existingModel = await RelationshipAttributeNameModel.findByCodeIgnoringDateRange(code);
        if (existingModel === null) {
            console.log(`- ${code}`.green);
            if (values.permittedValues) {
                for (let permittedValue of values.permittedValues) {
                    console.log(colors.gray(`  - ${permittedValue}`));
                }
            }
            const model = await RelationshipAttributeNameModel.create(values);
            return model;
        } else {
            console.log(`- ${code} ... skipped`.green);
            return existingModel;
        }
    }

    public static async createRelationshipAttributeNameUsageModels
    <T extends { attribute:IRelationshipAttributeName, optionalInd:boolean, defaultValue:string}>(attributeValues:T[]) {
        const attributeNameUsages:IRelationshipAttributeNameUsage[] = [];
        if (attributeValues) {
            for (let i = 0; i < attributeValues.length; i = i + 1) {
                const attributeValue = attributeValues[i];
                const truncatedDefaultValue = truncateString(attributeValue.defaultValue);
                console.log(`  - ${attributeValue.attribute.code} (${truncatedDefaultValue})`.green);
                const attributeNameUsage = await RelationshipAttributeNameUsageModel.create({
                    attributeName: attributeValue.attribute,
                    optionalInd: attributeValue.optionalInd,
                    defaultValue: attributeValue.defaultValue
                });
                attributeNameUsages.push(attributeNameUsage);
            }
        }
        return attributeNameUsages;
    }

    public static async createRelationshipTypeModel
    <T extends { attribute:IRelationshipAttributeName, optionalInd:boolean, defaultValue:string}>
    (values:IRelationshipType, attributeValues:T[]) {
        const code = values.code;
        const existingModel = await RelationshipTypeModel.findByCodeIgnoringDateRange(code);
        if (existingModel === null) {
            console.log(`- ${code}`.magenta);
            values.attributeNameUsages = await Seeder.createRelationshipAttributeNameUsageModels(attributeValues);
            const model = await RelationshipTypeModel.create(values);
            console.log('');
            return model;
        } else {
            console.log(`- ${code} ... skipped`.magenta);
            return existingModel;
        }
    }

    public static async createSharedSecretTypeModel(values:ISharedSecretType) {
        const code = values.code;
        const existingModel = await SharedSecretTypeModel.findByCodeIgnoringDateRange(code);
        if (existingModel === null) {
            console.log(`- ${code}`.red);
            const model = await SharedSecretTypeModel.create(values);
            return model;
        } else {
            console.log(`- ${code} ...`.red);
            return existingModel;
        }
    }

    public static async createSharedSecretModel(values:ISharedSecret) {
        console.log(`- Secret    : ${values.sharedSecretType.code} (${values.value})`.cyan);
        const model = await SharedSecretModel.create(values);
        return model;
    }

    public static async createNameModel(values:IName) {
        if (values.givenName || values.familyName) {
            console.log(`- Name      : ${values.givenName} ${values.familyName}`.cyan);
        } else {
            console.log(`- Name      : ${values.unstructuredName}`.cyan);
        }
        const model = await NameModel.create(values);
        return model;
    } 

    public static async createProfileModel(values:IProfile) {
        console.log(`- Profile   : ${values.provider}`.cyan);
        const model = await ProfileModel.create(values);
        return model;
    }

    public static async createPartyModel(values:IParty) {
        console.log(`- Party     : ${values.partyType}`.cyan);
        const model = await PartyModel.create(values);
        return model;
    }

    public static async createIdentityModel(values:IIdentity) {
        const model = await IdentityModel.create(values);
        console.log(`- Identity  : ${model.idValue}`.cyan);
        return model;
    }

    public static async createRelationshipModel(values:IRelationship) {
        if (values.subjectNickName.givenName || values.subjectNickName.familyName) {
            console.log(`- Subject   : ${values.subjectNickName.givenName} ${values.subjectNickName.familyName}`.cyan);
        } else {
            console.log(`- Subject   : ${values.subjectNickName.unstructuredName}`.cyan);
        }
        if (values.subjectNickName.givenName || values.delegateNickName.familyName) {
            console.log(`- Delegate  : ${values.delegateNickName.givenName} ${values.delegateNickName.familyName}`.cyan);
        } else {
            console.log(`- Delegate  : ${values.delegateNickName.unstructuredName}`.cyan);
        }
        console.log(`- Start At  : ${values.startTimestamp}`.cyan);
        console.log(`- Status    : ${values.status}`.cyan);
        const model = await RelationshipModel.create(values);
        return model;
    }

    /* tslint:disable:max-func-body-length */
    public static async loadRelationshipOtherAttributeNames() {
        try {

            console.log('\nInserting Relationship Attribute Names (other):\n'.underline);

            Seeder.permissionCustomisationAllowedInd_attributeName = await Seeder.createRelationshipAttributeNameModel({
                code: 'PERMISSION_CUSTOMISATION_ALLOWED_IND',
                shortDecodeText: 'Permission Customisation Allowed Indicator',
                longDecodeText: 'Permission Customisation Allowed Indicator',
                startDate: now,
                domain: RelationshipAttributeNameDomain.Boolean.name,
                classifier: RelationshipAttributeNameClassifier.Other.name,
                category: null,
                purposeText: 'Indicator of whether a relationship type allows the user to customise permission levels'
            } as IRelationshipAttributeName);

            Seeder.delegateManageAuthorisationAllowedInd_attributeName = await Seeder.createRelationshipAttributeNameModel({
                code: 'DELEGATE_MANAGE_AUTHORISATION_ALLOWED_IND',
                shortDecodeText: 'Delegate Manage Authorisations Allowed Indicator',
                longDecodeText: 'Delegate Manage Authorisations Allowed Indicator',
                startDate: now,
                domain: RelationshipAttributeNameDomain.Boolean.name,
                classifier: RelationshipAttributeNameClassifier.Other.name,
                category: null,
                purposeText: 'Indicator of whether a relationship allows the delegate to manage authorisations'
            } as IRelationshipAttributeName);

            Seeder.delegateRelationshipTypeDeclaration_attributeName = await Seeder.createRelationshipAttributeNameModel({
                code: 'DELEGATE_RELATIONSHIP_TYPE_DECLARATION',
                shortDecodeText: 'Delegate Relationship Type Declaration',
                longDecodeText: 'Delegate Relationship Type Declaration',
                startDate: now,
                domain: RelationshipAttributeNameDomain.Markdown.name,
                classifier: RelationshipAttributeNameClassifier.Other.name,
                category: null,
                purposeText: 'Delegate specific declaration in Markdown for a relationship type'
            } as IRelationshipAttributeName);

            Seeder.subjectRelationshipTypeDeclaration_attributeName = await Seeder.createRelationshipAttributeNameModel({
                code: 'SUBJECT_RELATIONSHIP_TYPE_DECLARATION',
                shortDecodeText: 'Subject Relationship Type Declaration',
                longDecodeText: 'Subject Relationship Type Declaration',
                startDate: now,
                domain: RelationshipAttributeNameDomain.Markdown.name,
                classifier: RelationshipAttributeNameClassifier.Other.name,
                category: null,
                purposeText: 'Subject specific declaration in Markdown for a relationship type'
            } as IRelationshipAttributeName);

        } catch (e) {
            console.log('Seeding failed!');
            console.log(e);
        }
    }

    /* tslint:disable:max-func-body-length */
    public static async loadRelationshipPermissionAttributeNames() {
        try {

            console.log('\nInserting Relationship Attribute Names (permission):\n'.underline);

            const administrativeServices_category = 'Administrative Services';

            Seeder.asic_abn_attributeName = await Seeder.createRelationshipAttributeNameModel({
                code: 'ASIC_ABN_PERMISSION',
                shortDecodeText: 'Australian Securities and Investments Commission (ASIC)',
                longDecodeText: 'ABN / BN Project (limited release)',
                startDate: now,
                domain: RelationshipAttributeNameDomain.SelectSingle.name,
                classifier: RelationshipAttributeNameClassifier.Permission.name,
                category: administrativeServices_category,
                purposeText: 'A permission for a relationship',
                permittedValues: Seeder.accessLevels
            } as IRelationshipAttributeName);

            Seeder.wgea_activate_attributeName = await Seeder.createRelationshipAttributeNameModel({
                code: 'WGEA_ACTIVATE_PERMISSION',
                shortDecodeText: 'Workplace Gender Equality Agency (WGEA)',
                longDecodeText: 'Activate',
                startDate: now,
                domain: RelationshipAttributeNameDomain.SelectSingle.name,
                classifier: RelationshipAttributeNameClassifier.Permission.name,
                category: administrativeServices_category,
                purposeText: 'A permission for a relationship',
                permittedValues: Seeder.accessLevels
            } as IRelationshipAttributeName);

            Seeder.deptindustry_aba_attributeName = await Seeder.createRelationshipAttributeNameModel({
                code: 'DEPTOFINDUSTRY_ABA_PERMISSION',
                shortDecodeText: 'Department of Industry',
                longDecodeText: 'Australian Business Account (ABA) - ABLIS',
                startDate: now,
                domain: RelationshipAttributeNameDomain.SelectSingle.name,
                classifier: RelationshipAttributeNameClassifier.Permission.name,
                category: administrativeServices_category,
                purposeText: 'A permission for a relationship',
                permittedValues: Seeder.accessLevels
            } as IRelationshipAttributeName);

            Seeder.abr_abr_attributeName = await Seeder.createRelationshipAttributeNameModel({
                code: 'ABR_ABR_PERMISSION',
                shortDecodeText: 'Australian Business Register (ABR)',
                longDecodeText: 'Australian Business Register',
                startDate: now,
                domain: RelationshipAttributeNameDomain.SelectSingle.name,
                classifier: RelationshipAttributeNameClassifier.Permission.name,
                category: administrativeServices_category,
                purposeText: 'A permission for a relationship',
                permittedValues: Seeder.accessLevels
            } as IRelationshipAttributeName);

            Seeder.deptindustry_ats_attributeName = await Seeder.createRelationshipAttributeNameModel({
                code: 'DEPTOFINDUSTRY_ATS_PERMISSION',
                shortDecodeText: 'Department of Industry',
                longDecodeText: 'Automotive Transformation Scheme (ATS)',
                startDate: now,
                domain: RelationshipAttributeNameDomain.SelectSingle.name,
                classifier: RelationshipAttributeNameClassifier.Permission.name,
                category: administrativeServices_category,
                purposeText: 'A permission for a relationship',
                permittedValues: Seeder.accessLevels
            } as IRelationshipAttributeName);

            Seeder.ntdeptbusiness_avetmiss_attributeName = await Seeder.createRelationshipAttributeNameModel({
                code: 'NTDEPTOFBUSINESS_AVETMISS_PERMISSION',
                shortDecodeText: 'NT Department of Business',
                longDecodeText: 'AVETMISS Training Portal',
                startDate: now,
                domain: RelationshipAttributeNameDomain.SelectSingle.name,
                classifier: RelationshipAttributeNameClassifier.Permission.name,
                category: administrativeServices_category,
                purposeText: 'A permission for a relationship',
                permittedValues: Seeder.accessLevels
            } as IRelationshipAttributeName);

            Seeder.ntdeptcorpinfoservices_ims_attributeName = await Seeder.createRelationshipAttributeNameModel({
                code: 'NTDEPTOFCORPINFOSERVICES_IMS_PERMISSION',
                shortDecodeText: 'NT Department of Corporate & Information Services - DCIS',
                longDecodeText: 'Identity Management System (IMS) - Invoice Portal – Invoice NTG',
                startDate: now,
                domain: RelationshipAttributeNameDomain.SelectSingle.name,
                classifier: RelationshipAttributeNameClassifier.Permission.name,
                category: administrativeServices_category,
                purposeText: 'A permission for a relationship',
                permittedValues: Seeder.accessLevels
            } as IRelationshipAttributeName);

            Seeder.depthscentrelink_ppl_attributeName = await Seeder.createRelationshipAttributeNameModel({
                code: 'DEPTOFHUMANSERVICESCENTRELINK_PPL_PERMISSION',
                shortDecodeText: 'Department of Human Services - Centrelink',
                longDecodeText: 'Paid Parental Leave',
                startDate: now,
                domain: RelationshipAttributeNameDomain.SelectSingle.name,
                classifier: RelationshipAttributeNameClassifier.Permission.name,
                category: administrativeServices_category,
                purposeText: 'A permission for a relationship',
                permittedValues: Seeder.accessLevels
            } as IRelationshipAttributeName);

            Seeder.deptimm_skillselect_attributeName = await Seeder.createRelationshipAttributeNameModel({
                code: 'DEPTOFIMMIGRATION_SKILLSELECT_PERMISSION',
                shortDecodeText: 'Department of Immigration and Border Protection',
                longDecodeText: 'Skill Select',
                startDate: now,
                domain: RelationshipAttributeNameDomain.SelectSingle.name,
                classifier: RelationshipAttributeNameClassifier.Permission.name,
                category: administrativeServices_category,
                purposeText: 'A permission for a relationship',
                permittedValues: Seeder.accessLevels
            } as IRelationshipAttributeName);

            Seeder.deptemp_wageconnect_attributeName = await Seeder.createRelationshipAttributeNameModel({
                code: 'DEPTEMPLOYMENT_WAGECONNECT_PERMISSION',
                shortDecodeText: 'Department of Employment',
                longDecodeText: 'Wage Connect',
                startDate: now,
                domain: RelationshipAttributeNameDomain.SelectSingle.name,
                classifier: RelationshipAttributeNameClassifier.Permission.name,
                category: administrativeServices_category,
                purposeText: 'A permission for a relationship',
                permittedValues: Seeder.accessLevels
            } as IRelationshipAttributeName);

        } catch (e) {
            console.log('Seeding failed!');
            console.log(e);
        }
    }

    /* tslint:disable:max-func-body-length */
    public static async loadRelationshipTypes() {
        try {

            console.log('\nInserting Relationship Types:\n'.underline);

            Seeder.universal_delegate_relationshipType = await Seeder.createRelationshipTypeModel({
                code: 'UNIVERSAL_REPRESENTATIVE',
                shortDecodeText: 'Universal Representative',
                longDecodeText: 'Universal Representative',
                startDate: now
            } as IRelationshipType, [
                {attribute: Seeder.permissionCustomisationAllowedInd_attributeName, optionalInd: false, defaultValue: 'false'},
                {attribute: Seeder.delegateManageAuthorisationAllowedInd_attributeName, optionalInd: false, defaultValue: 'false'},
                {attribute: Seeder.delegateRelationshipTypeDeclaration_attributeName, optionalInd: false,
                    defaultValue: 'Markdown for Delegate Universal Representative Declaration'},
                {attribute: Seeder.subjectRelationshipTypeDeclaration_attributeName, optionalInd: false,
                    defaultValue: 'Markdown for Subject Universal Representative Declaration'},
                {attribute: Seeder.asic_abn_attributeName, optionalInd: false, defaultValue: Seeder.full_accessLevel},
                {attribute: Seeder.wgea_activate_attributeName, optionalInd: false, defaultValue: Seeder.full_accessLevel},
                {attribute: Seeder.deptindustry_aba_attributeName, optionalInd: false, defaultValue: Seeder.full_accessLevel},
                {attribute: Seeder.abr_abr_attributeName, optionalInd: false, defaultValue: Seeder.full_accessLevel},
                {attribute: Seeder.deptindustry_ats_attributeName, optionalInd: false, defaultValue: Seeder.full_accessLevel},
                {attribute: Seeder.ntdeptbusiness_avetmiss_attributeName, optionalInd: false, defaultValue: Seeder.full_accessLevel},
                {attribute: Seeder.ntdeptcorpinfoservices_ims_attributeName, optionalInd: false, defaultValue: Seeder.full_accessLevel},
                {attribute: Seeder.depthscentrelink_ppl_attributeName, optionalInd: false, defaultValue: Seeder.full_accessLevel},
                {attribute: Seeder.deptimm_skillselect_attributeName, optionalInd: false, defaultValue: Seeder.full_accessLevel},
                {attribute: Seeder.deptemp_wageconnect_attributeName, optionalInd: false, defaultValue: Seeder.full_accessLevel}
            ]);

            Seeder.custom_delegate_relationshipType = await Seeder.createRelationshipTypeModel({
                code: 'CUSTOM_REPRESENTATIVE',
                shortDecodeText: 'Custom Representative',
                longDecodeText: 'Custom Representative',
                startDate: now
            } as IRelationshipType, [
                {attribute: Seeder.permissionCustomisationAllowedInd_attributeName, optionalInd: false, defaultValue: 'true'},
                {attribute: Seeder.delegateManageAuthorisationAllowedInd_attributeName, optionalInd: false, defaultValue: 'false'},
                {attribute: Seeder.delegateRelationshipTypeDeclaration_attributeName, optionalInd: false,
                    defaultValue: 'Markdown for Delegate Custom Representative Declaration'},
                {attribute: Seeder.subjectRelationshipTypeDeclaration_attributeName, optionalInd: false,
                    defaultValue: 'Markdown for Subject Custom Representative Declaration'},
                {attribute: Seeder.asic_abn_attributeName, optionalInd: false, defaultValue: null},
                {attribute: Seeder.wgea_activate_attributeName, optionalInd: false, defaultValue: null},
                {attribute: Seeder.deptindustry_aba_attributeName, optionalInd: false, defaultValue: null},
                {attribute: Seeder.abr_abr_attributeName, optionalInd: false, defaultValue: null},
                {attribute: Seeder.deptindustry_ats_attributeName, optionalInd: false, defaultValue: null},
                {attribute: Seeder.ntdeptbusiness_avetmiss_attributeName, optionalInd: false, defaultValue: null},
                {attribute: Seeder.ntdeptcorpinfoservices_ims_attributeName, optionalInd: false, defaultValue: null},
                {attribute: Seeder.depthscentrelink_ppl_attributeName, optionalInd: false, defaultValue: null},
                {attribute: Seeder.deptimm_skillselect_attributeName, optionalInd: false, defaultValue: null},
                {attribute: Seeder.deptemp_wageconnect_attributeName, optionalInd: false, defaultValue: null}
            ]);

        } catch (e) {
            console.log('Seeding failed!');
            console.log(e);
        }
    }

    /* tslint:disable:max-func-body-length */
    public static async loadSharedSecretTypes() {
        try {

            console.log('\nInserting Shared Secret Types:\n'.underline);

            Seeder.dob_sharedSecretType = await Seeder.createSharedSecretTypeModel({
                code: 'DATE_OF_BIRTH',
                shortDecodeText: 'Date of Birth',
                longDecodeText: 'Date of Birth',
                startDate: now,
                domain: 'DEFAULT'
            } as ISharedSecretType);

        } catch (e) {
            console.log('Seeding failed!');
            console.log(e);
        }
    }

    /* tslint:disable:max-func-body-length */
    public static async loadSample_jensCateringPtyLtd_identity() {
        try {

            console.log('\nInserting Sample Identity - Jen\'s Catering Pty Ltd:\n'.underline);

            if (!conf.devMode) {

                console.log('Skipped in prod mode'.gray);

            } else {

                Seeder.jenscatering_name = await Seeder.createNameModel({
                    unstructuredName: 'Jen\'s Catering Pty Ltd'
                } as IName);

                Seeder.jenscatering_profile = await Seeder.createProfileModel({
                    provider: ProfileProvider.MyGov.name,
                    name: Seeder.jenscatering_name,
                    sharedSecrets: []
                } as IProfile);

                Seeder.jenscatering_party = await Seeder.createPartyModel({
                    partyType: PartyType.ABN.name
                } as IParty);

                console.log('');

                Seeder.jenscatering_identity_1 = await Seeder.createIdentityModel({
                    rawIdValue: 'jenscatering_identity_1',
                    identityType: IdentityType.PublicIdentifier.name,
                    defaultInd: true,
                    publicIdentifierScheme: IdentityPublicIdentifierScheme.ABN.name,
                    profile: Seeder.jenscatering_profile,
                    party: Seeder.jenscatering_party
                } as IIdentity);

            }

        } catch (e) {
            console.log('Seeding failed!');
            console.log(e);
        }
    }

    /* tslint:disable:max-func-body-length */
    public static async loadSample_jenniferMaxim_identity() {
        try {

            console.log('\nInserting Sample Identity - Jennifer Maxim:\n'.underline);

            if (!conf.devMode) {

                console.log('Skipped in prod mode'.gray);

            } else {

                Seeder.jennifermaxims_name = await Seeder.createNameModel({
                    givenName: 'Jennifer',
                    familyName: 'Maxims'
                } as IName);

                Seeder.jennifermaxims_dob = await Seeder.createSharedSecretModel({
                    value: '31/01/1990',
                    sharedSecretType: Seeder.dob_sharedSecretType
                } as ISharedSecret);

                Seeder.jennifermaxims_profile = await Seeder.createProfileModel({
                    provider: ProfileProvider.MyGov.name,
                    name: Seeder.jennifermaxims_name,
                    sharedSecrets: [Seeder.jennifermaxims_dob]
                } as IProfile);

                Seeder.jennifermaxims_party = await Seeder.createPartyModel({
                    partyType: PartyType.Individual.name
                } as IParty);

                console.log('');

                Seeder.jennifermaxims_identity_1 = await Seeder.createIdentityModel({
                    rawIdValue: 'jennifermaxims_identity_1',
                    identityType: IdentityType.LinkId.name,
                    defaultInd: true,
                    linkIdScheme: IdentityLinkIdScheme.MyGov.name,
                    profile: Seeder.jennifermaxims_profile,
                    party: Seeder.jennifermaxims_party
                } as IIdentity);

            }

        } catch (e) {
            console.log('Seeding failed!');
            console.log(e);
        }
    }

    /* tslint:disable:max-func-body-length */
    public static async loadSample_jenniferMaxim__jensCateringPtyLtd_relationship() {
        try {

            console.log('\nInserting Sample Relationship - Jen\'s Catering Pty Ltd / Jennifer Maxim:\n'.underline);

            if (!conf.devMode) {

                console.log('Skipped in prod mode'.gray);

            } else {

                Seeder.j_and_j_relationship = await Seeder.createRelationshipModel({
                    subject: Seeder.jenscatering_party,
                    subjectNickName: Seeder.jenscatering_name,
                    delegate: Seeder.jennifermaxims_party,
                    delegateNickName: Seeder.jennifermaxims_name,
                    startTimestamp: new Date(),
                    status: RelationshipStatus.Active.name
                } as IRelationship);

            }

        } catch (e) {
            console.log('Seeding failed!');
            console.log(e);
        }
    }

}

// rock and roll ......................................................................................................

Seeder.connect()
    .then(Seeder.dropDatabase)
    .then(Seeder.loadRelationshipOtherAttributeNames)
    .then(Seeder.loadRelationshipPermissionAttributeNames)
    .then(Seeder.loadRelationshipTypes)
    .then(Seeder.loadSharedSecretTypes)
    .then(Seeder.loadSample_jensCateringPtyLtd_identity)
    .then(Seeder.loadSample_jenniferMaxim_identity)
    .then(Seeder.loadSample_jenniferMaxim__jensCateringPtyLtd_relationship)
    .then(Seeder.disconnect);