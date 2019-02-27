import describe2ts from '../index'
// tslint:disable-next-line:no-implicit-dependencies
import { DescribeSObjectResult, Field, ChildRelationship } from 'jsforce'
import Contact from './Contact.desc.json'
import { SF2TSTypeMap } from '../sf-type'

// tslint:disable:no-object-literal-type-assertion

describe('describe2ts', () => {
  it('gets the typescript type for all fields', () => {
    expect(
      describe2ts(
        {
          name: 'Contact',
          fields: [
            {
              name: 'FirstName',
              nillable: false,
              createable: true,
              updateable: true,
              type: 'string',
            },
            {
              name: 'LastName',
              nillable: false,
              createable: true,
              updateable: true,
              type: 'string',
            },
            {
              name: 'PhotoUrl',
              nillable: true,
              createable: false,
              updateable: false,
              type: 'url',
            },
          ],
        } as DescribeSObjectResult,
        () => null,
      ),
    ).toEqual(
      `export interface Contact {
  "FirstName": string
  "LastName": string
  readonly "PhotoUrl"?: string | null | undefined
}
export default Contact`,
    )
  })

  it('gets the typescript type for all parent fields', () => {
    expect(
      describe2ts(
        {
          name: 'Contact',
          fields: [
            {
              name: 'AccountId',
              nillable: true,
              referenceTo: ['Account'],
              relationshipName: 'Account',
              type: 'reference',
              createable: true,
              updateable: true,
            },
          ],
        } as DescribeSObjectResult,
        () => 'import("./Account.interface.ts").default',
      ),
    ).toBe(
      `export interface Contact {
  "AccountId"?: string | null | undefined
  "Account"?: import("./Account.interface.ts").default | null | undefined
}
export default Contact`,
    )
  })

  it('gets the typescript type for all child fields', () => {
    expect(
      describe2ts(
        {
          name: 'Contact',
          childRelationships: [
            {
              cascadeDelete: true,
              childSObject: 'Attachment',
              deprecatedAndHidden: false,
              field: 'ParentId',
              junctionIdListNames: [],
              junctionReferenceTo: [],
              relationshipName: 'Attachments',
              restrictedDelete: false,
            } as ChildRelationship,
          ],
          fields: [] as Field[],
        } as DescribeSObjectResult,
        () => undefined,
      ),
    ).toBe(
      `export interface Contact {
  "Attachments"?: Array<object> | null | undefined
}
export default Contact`,
    )
  })

  it('allows specifiying an sobject resolver for childField nillability', () => {
    const fn = jest.fn()
    fn.mockReturnValue(null)
    expect(
      describe2ts(
        {
          name: 'Contact',
          childRelationships: [
            {
              cascadeDelete: true,
              childSObject: 'Attachment',
              deprecatedAndHidden: false,
              field: 'ParentId',
              junctionIdListNames: [],
              junctionReferenceTo: [],
              relationshipName: 'Attachments',
              restrictedDelete: false,
            } as ChildRelationship,
          ],
          fields: [] as Field[],
        } as DescribeSObjectResult,
        () => null,
        fn,
      ),
    ).toEqual(
      `export interface Contact {
  "Attachments"?: Array<object> | null | undefined
}
export default Contact`,
    )

    expect(fn).toHaveBeenCalledWith('Attachment')
  })

  it('allows specifying a custom type map', () => {
    const fn = jest.fn()
    fn.mockReturnValue('boolean')
    const typeMap = ({ url: fn } as unknown) as SF2TSTypeMap

    expect(
      describe2ts(
        {
          name: 'Contact',
          fields: [
            {
              name: 'PhotoUrl',
              nillable: true,
              createable: false,
              updateable: false,
              type: 'url',
            },
          ],
        } as DescribeSObjectResult,
        () => null,
        undefined,
        undefined,
        typeMap,
      ),
    ).toEqual(
      `export interface Contact {
  readonly "PhotoUrl"?: boolean | null | undefined
}
export default Contact`,
    )

    expect(typeMap.url).toHaveBeenCalled()
  })

  it('allows specifying newtypes', () => {
    expect(
      describe2ts(
        {
          name: 'Contact',
          fields: [
            {
              name: 'PhotoUrl',
              nillable: true,
              createable: false,
              updateable: false,
              type: 'url',
            },
          ],
        } as DescribeSObjectResult,
        () => null,
        undefined,
        true,
      ),
    ).toEqual(
      `export interface Contact {
  readonly "PhotoUrl"?: import("describe2ts/newtypes/Url").default | null | undefined
}
export default Contact`,
    )
  })

  it('allows not exporting default', () => {
    expect(
      describe2ts(
        {
          name: 'Contact',
          fields: [
            {
              name: 'PhotoUrl',
              nillable: true,
              createable: false,
              updateable: false,
              type: 'url',
            },
          ],
        } as DescribeSObjectResult,
        () => null,
        undefined,
        undefined,
        undefined,
        false,
      ),
    ).toEqual(
      `export interface Contact {
  readonly "PhotoUrl"?: string | null | undefined
}`,
    )
  })

  it('produces the expected interface given the Contact describe (regression test)', () => {
    const value = describe2ts(
      Contact,
      (name: string) => `import("./${name}.interface.ts").default`,
    )

    expect(value).toBe(
      `export interface Contact {
  readonly "Id": string
  readonly "IsDeleted": boolean
  readonly "MasterRecordId"?: string | null | undefined
  "AccountId"?: string | null | undefined
  "LastName": string
  "FirstName"?: string | null | undefined
  "Salutation"?: "Mr." | "Ms." | "Mrs." | "Dr." | "Prof." | null | undefined
  readonly "Name": string
  "RecordTypeId"?: string | null | undefined
  "OtherStreet"?: string | null | undefined
  "OtherCity"?: string | null | undefined
  "OtherState"?: string | null | undefined
  "OtherPostalCode"?: string | null | undefined
  "OtherCountry"?: string | null | undefined
  "OtherLatitude"?: number | null | undefined
  "OtherLongitude"?: number | null | undefined
  "OtherGeocodeAccuracy"?: "Address" | "NearAddress" | "Block" | "Street" | "ExtendedZip" | "Zip" | "Neighborhood" | "City" | "County" | "State" | "Unknown" | null | undefined
  readonly "OtherAddress"?: object | null | undefined
  "MailingStreet"?: string | null | undefined
  "MailingCity"?: string | null | undefined
  "MailingState"?: string | null | undefined
  "MailingPostalCode"?: string | null | undefined
  "MailingCountry"?: string | null | undefined
  "MailingLatitude"?: number | null | undefined
  "MailingLongitude"?: number | null | undefined
  "MailingGeocodeAccuracy"?: "Address" | "NearAddress" | "Block" | "Street" | "ExtendedZip" | "Zip" | "Neighborhood" | "City" | "County" | "State" | "Unknown" | null | undefined
  readonly "MailingAddress"?: object | null | undefined
  "Phone"?: string | null | undefined
  "Fax"?: string | null | undefined
  "MobilePhone"?: string | null | undefined
  "HomePhone"?: string | null | undefined
  "OtherPhone"?: string | null | undefined
  "AssistantPhone"?: string | null | undefined
  "ReportsToId"?: string | null | undefined
  "Email"?: string | null | undefined
  "Title"?: string | null | undefined
  "Department"?: string | null | undefined
  "AssistantName"?: string | null | undefined
  "LeadSource"?: "Advertisement" | "Employee Referral" | "External Referral" | "Partner" | "Public Relations" | "Seminar - Internal" | "Seminar - Partner" | "Trade Show" | "Web" | "Word of mouth" | "Other" | "Bob" | null | undefined
  "Birthdate"?: string | null | undefined
  "Description"?: string | null | undefined
  "OwnerId": string
  "HasOptedOutOfEmail": boolean
  readonly "CreatedDate": string
  readonly "CreatedById": string
  readonly "LastModifiedDate": string
  readonly "LastModifiedById": string
  readonly "SystemModstamp": string
  readonly "LastActivityDate"?: string | null | undefined
  readonly "LastCURequestDate"?: string | null | undefined
  readonly "LastCUUpdateDate"?: string | null | undefined
  readonly "LastViewedDate"?: string | null | undefined
  readonly "LastReferencedDate"?: string | null | undefined
  "EmailBouncedReason"?: string | null | undefined
  "EmailBouncedDate"?: string | null | undefined
  readonly "IsEmailBounced": boolean
  readonly "PhotoUrl"?: string | null | undefined
  "Jigsaw"?: string | null | undefined
  readonly "JigsawContactId"?: string | null | undefined
  "Suffix__c"?: string | null | undefined
  "Middle_Names__c"?: string | null | undefined
  "Became_a_Research_Examiner__c"?: string | null | undefined
  "Mail_Preference__c"?: "Mail (office)" | "Other (home)" | null | undefined
  "Instructor__c": boolean
  "Offered_Services__c"?: string | null | undefined
  "Shingo_Prize_Relationship__c"?: string | null | undefined
  "Plan__c"?: string | null | undefined
  "Do__c"?: string | null | undefined
  "Check__c"?: string | null | undefined
  "Act__c"?: string | null | undefined
  "Recipient__c"?: string | null | undefined
  "A_Number__c"?: string | null | undefined
  "Description__c"?: string | null | undefined
  "Media_Contact__c": boolean
  "Publication__c"?: "Automotive" | "General" | "Healthcare" | "Manufacturing" | "Technology" | null | undefined
  "Asst_Email__c"?: string | null | undefined
  "Other_Email__c"?: string | null | undefined
  readonly "Contact_Quality__c"?: number | null | undefined
  "Date_Last_Reviewed__c"?: string | null | undefined
  "Shirt_Size__c"?: string | null | undefined
  "Industry_Type__c"?: string | null | undefined
  "Industry__c"?: string | null | undefined
  "Start_Date__c"?: string | null | undefined
  "End_Date__c"?: string | null | undefined
  "Biography__c"?: string | null | undefined
  "Photograph__c"?: string | null | undefined
  "Facilitator_For__c"?: string | null | undefined
  "Qualified_Industry__c"?: string | null | undefined
  "Qualified_Language__c"?: string | null | undefined
  "Qualified_Regions__c"?: string | null | undefined
  "Qualified_Workshops__c"?: string | null | undefined
  "Has_Watched_Most_Recent_Webinar__c": boolean
  "Job_History__c"?: string | null | undefined
  readonly "MasterRecord"?: import("./Contact.interface.ts").default | null | undefined
  "Account"?: import("./Account.interface.ts").default | null | undefined
  "RecordType"?: import("./RecordType.interface.ts").default | null | undefined
  "ReportsTo"?: import("./Contact.interface.ts").default | null | undefined
  "Owner": import("./User.interface.ts").default
  readonly "CreatedBy": import("./User.interface.ts").default
  readonly "LastModifiedBy": import("./User.interface.ts").default
  "Facilitator_For__r"?: import("./Account.interface.ts").default | null | undefined
  "AcceptedEventRelations"?: Array<import("./AcceptedEventRelation.interface.ts").default> | null | undefined
  "Accounts__r"?: Array<import("./Account.interface.ts").default> | null | undefined
  "Sponsor_Accounts__r"?: Array<import("./Account.interface.ts").default> | null | undefined
  "Accounts1__r"?: Array<import("./Account.interface.ts").default> | null | undefined
  "AccountContactRoles"?: Array<import("./AccountContactRole.interface.ts").default> | null | undefined
  "ActivityHistories"?: Array<import("./ActivityHistory.interface.ts").default> | null | undefined
  "Assessments__r"?: Array<import("./Assessment__c.interface.ts").default> | null | undefined
  "Assessments1__r"?: Array<import("./Assessment__c.interface.ts").default> | null | undefined
  "Assets"?: Array<import("./Asset.interface.ts").default> | null | undefined
  "AttachedContentDocuments"?: Array<import("./AttachedContentDocument.interface.ts").default> | null | undefined
  "AttachedContentNotes"?: Array<import("./AttachedContentNote.interface.ts").default> | null | undefined
  "Attachments"?: Array<import("./Attachment.interface.ts").default> | null | undefined
  "CampaignMembers"?: Array<import("./CampaignMember.interface.ts").default> | null | undefined
  "Cases"?: Array<import("./Case.interface.ts").default> | null | undefined
  "CaseContactRoles"?: Array<import("./CaseContactRole.interface.ts").default> | null | undefined
  "CombinedAttachments"?: Array<import("./CombinedAttachment.interface.ts").default> | null | undefined
  "Histories"?: Array<import("./ContactHistory.interface.ts").default> | null | undefined
  "Shares"?: Array<import("./ContactShare.interface.ts").default> | null | undefined
  "ContentDocumentLinks"?: Array<import("./ContentDocumentLink.interface.ts").default> | null | undefined
  "ContractsSigned"?: Array<import("./Contract.interface.ts").default> | null | undefined
  "ContractContactRoles"?: Array<import("./ContractContactRole.interface.ts").default> | null | undefined
  "DeclinedEventRelations"?: Array<import("./DeclinedEventRelation.interface.ts").default> | null | undefined
  "DuplicateRecordItems"?: Array<import("./DuplicateRecordItem.interface.ts").default> | null | undefined
  "EmailMessageRelations"?: Array<import("./EmailMessageRelation.interface.ts").default> | null | undefined
  "EmailStatuses"?: Array<import("./EmailStatus.interface.ts").default> | null | undefined
  "Events"?: Array<import("./Event.interface.ts").default> | null | undefined
  "EventRelations"?: Array<import("./EventRelation.interface.ts").default> | null | undefined
  "Event_MDFs__r"?: Array<import("./Event_MDF__c.interface.ts").default> | null | undefined
  "Registrations__r"?: Array<import("./Event_Registration__c.interface.ts").default> | null | undefined
  "Events1__r"?: Array<import("./Event__c.interface.ts").default> | null | undefined
  "Events2__r"?: Array<import("./Event__c.interface.ts").default> | null | undefined
  "Shingo_Events_Organized__r"?: Array<import("./Event__c.interface.ts").default> | null | undefined
  "Events__r"?: Array<import("./Event__c.interface.ts").default> | null | undefined
  "FacilitatorLeadAssociations__r"?: Array<import("./FacilitatorLeadAssociation__c.interface.ts").default> | null | undefined
  "Insight_Organizations__r"?: Array<import("./Insight_Organization__c.interface.ts").default> | null | undefined
  "Instructor_Certifications__r"?: Array<import("./Instructor_Certification__c.interface.ts").default> | null | undefined
  "Notes"?: Array<import("./Note.interface.ts").default> | null | undefined
  "NotesAndAttachments"?: Array<import("./NoteAndAttachment.interface.ts").default> | null | undefined
  "OpenActivities"?: Array<import("./OpenActivity.interface.ts").default> | null | undefined
  "OpportunityContactRoles"?: Array<import("./OpportunityContactRole.interface.ts").default> | null | undefined
  "ProcessInstances"?: Array<import("./ProcessInstance.interface.ts").default> | null | undefined
  "ProcessSteps"?: Array<import("./ProcessInstanceHistory.interface.ts").default> | null | undefined
  "Publication_Awards__r"?: Array<import("./Publication_Award__c.interface.ts").default> | null | undefined
  "Publication_Awards1__r"?: Array<import("./Publication_Award__c.interface.ts").default> | null | undefined
  "Research_Awards__r"?: Array<import("./Research_Award__c.interface.ts").default> | null | undefined
  "SCOPE_Users__r"?: Array<import("./SCOPEUser__c.interface.ts").default> | null | undefined
  "Shingo_Event_Registrations__r"?: Array<import("./Shingo_Attendee__c.interface.ts").default> | null | undefined
  "Shingo_Events__r"?: Array<import("./Shingo_Event__c.interface.ts").default> | null | undefined
  "Shingo_Exhibitors__r"?: Array<import("./Shingo_Exhibitor__c.interface.ts").default> | null | undefined
  "Shingo_Registrations__r"?: Array<import("./Shingo_Registration__c.interface.ts").default> | null | undefined
  "Shingo_Speakers__r"?: Array<import("./Shingo_Speaker__c.interface.ts").default> | null | undefined
  "Personas"?: Array<import("./SocialPersona.interface.ts").default> | null | undefined
  "Speakers__r"?: Array<import("./Speaker__c.interface.ts").default> | null | undefined
  "Tasks"?: Array<import("./Task.interface.ts").default> | null | undefined
  "TopicAssignments"?: Array<import("./TopicAssignment.interface.ts").default> | null | undefined
  "UndecidedEventRelations"?: Array<import("./UndecidedEventRelation.interface.ts").default> | null | undefined
  "Venues1__r"?: Array<import("./Venue__c.interface.ts").default> | null | undefined
  "Venues2__r"?: Array<import("./Venue__c.interface.ts").default> | null | undefined
  "Venues__r"?: Array<import("./Venue__c.interface.ts").default> | null | undefined
  "Workshops__r"?: Array<import("./WorkshopFacilitatorAssociation__c.interface.ts").default> | null | undefined
  "Workshops_Attended__r"?: Array<import("./Workshop_Attendee__c.interface.ts").default> | null | undefined
  "Workshop_Evals__r"?: Array<import("./Workshop_Eval__c.interface.ts").default> | null | undefined
  "Course_Manager_Of__r"?: Array<import("./Workshop__c.interface.ts").default> | null | undefined
}
export default Contact`,
    )
  })
})
