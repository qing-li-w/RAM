import {connectDisconnectMongo, dropMongo} from './helpers';
import {
    IIdentity,
    IdentityModel,
    IdentityType,
    IdentityInvitationCodeStatus,
    IdentityPublicIdentifierScheme,
    IdentityLinkIdScheme} from '../models/identity.model';
import {
    IName,
    NameModel} from '../models/name.model';
import {
    IProfile,
    ProfileModel,
    ProfileProvider} from '../models/profile.model';

/* tslint:disable:max-func-body-length */
describe('RAM Identity', () => {

    connectDisconnectMongo();
    dropMongo();

    let name1: IName;
    let profile1: IProfile;
    let identity1: IIdentity;

    beforeEach(async (done) => {

        try {

            name1 = await NameModel.create({
                givenName: 'John',
                familyName: 'Smith',
                unstructuredName: 'John Smith'
            });

            profile1 = await ProfileModel.create({
                provider: ProfileProvider.MyGov.name,
                name: name1
            });

            identity1 = await IdentityModel.create({
                idValue: 'uuid_1',
                identityType: IdentityType.LinkId.name,
                defaultInd: false,
                profile: profile1
            });

            done();

        } catch (e) {
            fail('Because ' + e);
            done();
        }

    });

    it('finds by id value and type', async (done) => {
        try {
            const instance = await IdentityModel.findByIdValueAndType(identity1.idValue, IdentityType.valueOf(identity1.identityType));
            expect(instance).not.toBeNull();
            done();
        } catch (e) {
            fail('Because ' + e);
            done();
        }
    });

    it('inserts base with valid values', async (done) => {
        try {

            const idValue = 'uuid_x';
            const type = IdentityType.LinkId;
            const defaultInd = false;

            const instance = await IdentityModel.create({
                idValue: idValue,
                identityType: type.name,
                defaultInd: defaultInd,
                profile: profile1
            });

            expect(instance).not.toBeNull();
            expect(instance.id).not.toBeNull();
            expect(instance.idValue).not.toBeNull();
            expect(instance.identityType).not.toBeNull();
            expect(instance.profile).not.toBeNull();
            expect(instance.profile.name).not.toBeNull();

            const retrievedInstance = await IdentityModel.findByIdValueAndType(idValue, type);
            expect(retrievedInstance).not.toBeNull();
            expect(retrievedInstance.id).toBe(instance.id);
            expect(retrievedInstance.identityType).toBe(type.name);
            expect(retrievedInstance.identityTypeEnum()).toBe(type);
            expect(retrievedInstance.defaultInd).toBe(defaultInd);
            expect(retrievedInstance.profile.id).toBe(profile1.id);
            expect(retrievedInstance.profile.name.id).toBe(name1.id);

            done();

        } catch (e) {
            fail('Because ' + e);
            done();
        }
    });

    it('inserts agency provided token with valid values', async (done) => {
        try {

            const idValue = 'uuid_x';
            const type = IdentityType.AgencyProvidedToken;
            const defaultInd = false;
            const agencyToken = 'agency_token_x';

            const instance = await IdentityModel.create({
                idValue: idValue,
                identityType: type.name,
                defaultInd: defaultInd,
                agencyToken: agencyToken,
                profile: profile1
            });

            const retrievedInstance = await IdentityModel.findByIdValueAndType(idValue, type);
            expect(retrievedInstance).not.toBeNull();
            expect(retrievedInstance.id).toBe(instance.id);
            expect(retrievedInstance.identityType).toBe(type.name);
            expect(retrievedInstance.identityTypeEnum()).toBe(type);
            expect(retrievedInstance.agencyToken).toBe(agencyToken);

            done();

        } catch (e) {
            fail('Because ' + e);
            done();
        }
    });

    it('inserts invitation code with valid values', async (done) => {
        try {

            const idValue = 'uuid_invitation_code';
            const type = IdentityType.InvitationCode;
            const defaultInd = false;
            const status = IdentityInvitationCodeStatus.Claimed;
            const expiryTimestamp = new Date(2055, 1, 1);
            const claimedTimestamp = new Date(2066, 1, 1);
            const emailAddress = 'bob@example.com';

            const instance = await IdentityModel.create({
                idValue: idValue,
                identityType: type.name,
                defaultInd: defaultInd,
                invitationCodeStatus: status.name,
                invitationCodeExpiryTimestamp: expiryTimestamp,
                invitationCodeClaimedTimestamp: claimedTimestamp,
                invitationCodeTemporaryEmailAddress: emailAddress,
                profile: profile1
            });

            const retrievedInstance = await IdentityModel.findByIdValueAndType(idValue, type);
            expect(retrievedInstance).not.toBeNull();
            expect(retrievedInstance.id).toBe(instance.id);
            expect(retrievedInstance.identityType).toBe(type.name);
            expect(retrievedInstance.identityTypeEnum()).toBe(type);
            expect(retrievedInstance.invitationCodeStatus).toBe(status.name);
            expect(retrievedInstance.invitationCodeStatusEnum()).toBe(status);
            expect(retrievedInstance.invitationCodeExpiryTimestamp.getTime()).toBe(expiryTimestamp.getTime());
            expect(retrievedInstance.invitationCodeClaimedTimestamp.getTime()).toBe(claimedTimestamp.getTime());
            expect(retrievedInstance.invitationCodeTemporaryEmailAddress).toBe(emailAddress);

            done();

        } catch (e) {
            fail('Because ' + e);
            done();
        }
    });

    it('inserts public identifier with valid values', async (done) => {
        try {

            const idValue = 'uuid_public_identifier';
            const type = IdentityType.PublicIdentifier;
            const defaultInd = false;
            const scheme = IdentityPublicIdentifierScheme.ABN;

            const instance = await IdentityModel.create({
                idValue: idValue,
                identityType: type.name,
                defaultInd: defaultInd,
                publicIdentifierScheme: scheme.name,
                profile: profile1
            });

            const retrievedInstance = await IdentityModel.findByIdValueAndType(idValue, type);
            expect(retrievedInstance).not.toBeNull();
            expect(retrievedInstance.id).toBe(instance.id);
            expect(retrievedInstance.identityType).toBe(type.name);
            expect(retrievedInstance.identityTypeEnum()).toBe(type);
            expect(retrievedInstance.publicIdentifierScheme).toBe(scheme.name);
            expect(retrievedInstance.publicIdentifierSchemeEnum()).toBe(scheme);

            done();

        } catch (e) {
            fail('Because ' + e);
            done();
        }
    });

    it('inserts link id with valid values', async (done) => {
        try {

            const idValue = 'uuid_link_id';
            const type = IdentityType.LinkId;
            const scheme = IdentityLinkIdScheme.MyGov;
            const defaultInd = false;

            const instance = await IdentityModel.create({
                idValue: idValue,
                identityType: type.name,
                defaultInd: defaultInd,
                linkIdScheme: scheme.name,
                profile: profile1
            });

            const retrievedInstance = await IdentityModel.findByIdValueAndType(idValue, type);
            expect(retrievedInstance).not.toBeNull();
            expect(retrievedInstance.id).toBe(instance.id);
            expect(retrievedInstance.identityType).toBe(type.name);
            expect(retrievedInstance.identityTypeEnum()).toBe(type);
            expect(retrievedInstance.linkIdScheme).toBe(scheme.name);
            expect(retrievedInstance.linkIdSchemeEnum()).toBe(scheme);

            done();

        } catch (e) {
            fail('Because ' + e);
            done();
        }
    });

    it('fails insert with invalid type', async (done) => {
        try {
            await IdentityModel.create({
                idValue: 'uuid_x',
                identityType: '__BOGUS__',
                defaultInd: false,
                profile: profile1
            });
            fail('should not have inserted with invalid type');
            done();
        } catch (e) {
            expect(e.name).toBe('ValidationError');
            expect(e.errors.type).not.toBeNull();
            done();
        }
    });

    it('fails insert with null type', async (done) => {
        try {
            await IdentityModel.create({
                idValue: 'uuid_x',
                defaultInd: false,
                profile: profile1
            });
            fail('should not have inserted with null type');
            done();
        } catch (e) {
            expect(e.name).toBe('ValidationError');
            expect(e.errors.type).not.toBeNull();
            done();
        }
    });

    it('fails insert with null profile', async (done) => {
        try {
            await IdentityModel.create({
                idValue: 'uuid_x',
                identityType: IdentityType.LinkId.name,
                defaultInd: false
            });
            fail('should not have inserted with null profile');
            done();
        } catch (e) {
            expect(e.name).toBe('ValidationError');
            expect(e.errors.profile).not.toBeNull();
            done();
        }
    });

    it('converts type to enum', async (done) => {
        try {
            expect(identity1).not.toBeNull();
            expect(identity1.identityType).toBe(IdentityType.LinkId.name);
            expect(identity1.identityTypeEnum()).toBe(IdentityType.LinkId);
            done();
        } catch (e) {
            fail('Because ' + e);
            done();
        }
    });

});