import {Component} from '@angular/core';
import {AccessPeriodComponent, AccessPeriodComponentData} from
'../commons/access-period/access-period.component';
import {AuthorisationPermissionsComponent} from
'../commons/authorisation-permissions/authorisation-permissions.component';
import {AuthorisationTypeComponent, AuthorisationTypeComponentData} from
'../commons/authorisation-type/authorisation-type.component';
import {DeclarationComponent} from
'../commons/declaration/declaration.component';
import {RepresentativeDetailsComponent, RepresentativeDetailsComponentData} from
'../commons/representative-details/representative-details.component';

@Component({
    selector: 'add-relationship',
    templateUrl: 'add-relationship.component.html',
    directives: [
        AccessPeriodComponent,
        AuthorisationPermissionsComponent,
        AuthorisationTypeComponent,
        DeclarationComponent,
        RepresentativeDetailsComponent
    ]
})
export class AddRelationshipComponent {
    public accessPeriodValidationErrors = {};

    public myVar: AddRelationshipComponentData = {
        accessPeriod: {
            startDate: null,
            noEndDate: true,
            endDate: null
        },
        authType: {
            authType: 'choose'
        },
        representativeDetails: {
            individual: {
                givenName: '',
                familyName: null,
                dob: null
            },
            organisation: {
                abn: ''
            }
        }
    };

    public dumpObject(v: Object) {
        // creates formatted JSON - display in <pre> tag
        return JSON.stringify(v, null, 2);
    }

    public submit() {
        console.dir(this.myVar);
    }
}

export interface AddRelationshipComponentData {
    accessPeriod: AccessPeriodComponentData;
    authType: AuthorisationTypeComponentData;
    representativeDetails: RepresentativeDetailsComponentData;
}