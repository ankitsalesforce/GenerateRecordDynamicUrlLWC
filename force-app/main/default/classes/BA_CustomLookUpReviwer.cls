public class BA_CustomLookUpReviwer {

    public static string WFName;
    
    @AuraEnabled
    public static boolean getdetails(String recId){
        List<BA_WorkflowDetails__c> workflow =  [Select Id,Name,BA_Tax_Approver__c 
                                                           FROM 
                                                                BA_WorkflowDetails__c
                                                            Where 
                                                                Id =: recId];
        List<PermissionSetAssignment>  permissionlst = [SELECT AssigneeId,Assignee.Name,Id,PermissionSetId,PermissionSet.Name 
                                                            FROM PermissionSetAssignment where PermissionSet.Name IN ('BA_Admin')
                                                            AND AssigneeId =: userinfo.getUserId()];
                                                                    
        WFName = workflow[0].Name;
        if(workflow.size()>0 && (workflow[0].BA_Tax_Approver__c==null || workflow[0].BA_Tax_Approver__c!= Userinfo.getUserId())){
           system.debug('return from workflow');
            
             if(permissionlst.size()>0){
               system.debug('return from permissionlst');
                return true;
               }
            return false; 
        }
       
     return true;
    }
    
    @AuraEnabled
    public static void saveData(String recId,String entitId){
        BA_WorkflowDetails__c work = new BA_WorkflowDetails__c();
        work.BA_Entity__c=  entitId;
        work.Id = recId;
        if(entitId != null || entitId != ''){
          update work;  
        }
      }
    
     @AuraEnabled
    public static void updateLECheckBox(Boolean LERequired,Id recordId){
        BA_WorkflowDetails__c workflow =  [Select Id,Name,BA_Tax_Approver__c,BA_New_LE_Required__c 
                                           FROM BA_WorkflowDetails__c WHERE Id =: recordId];
        system.debug('LE Required >> ' +LERequired);
        if(LERequired == True){
            workflow.BA_New_LE_Required__c = 'Yes';
            Update Workflow;
        }
  
    }

    @AuraEnabled(cacheable=true)
    public static list<BA_Questionnaire__c> getSimilarLE(string GoldId){
        map<id,Sobject> FinalMap1 = new map<id,Sobject>();
        list<BA_workflowDetails__c> quesWFList = [SELECT Name,BA_Questionnaire__r.Id,BA_Status__c,BA_Entity__r.BA_LE_Name__r.GE_HQ_Gold_ID__c FROM 
                                                  BA_WorkflowDetails__C where BA_Entity__r.BA_LE_Name__r.GE_HQ_Gold_ID__c=:GoldId
                                                  AND BA_Questionnaire__r.Pref_BH_Contracting_Entity_Lookup__c =''];
        for(BA_workflowDetails__c wf :quesWFList){
            FinalMap1.put(wf.BA_Questionnaire__r.Id,wf);
        }
        system.debug('FinalMap having key >> '+FinalMap1.keySet()+ 'and values >> ' +FinalMap1.values());
        
        list<BA_Questionnaire__c> QuesList = [SELECT id,name,Pref_BH_Contracting_Entity_Lookup__r.GE_HQ_Gold_ID__c,(SELECT Name,BA_Status__c,BA_Entity__r.BA_LE_Name__r.GE_HQ_Gold_ID__c FROM Workflow_Details__r where BA_Entity__r.BA_LE_Name__r.GE_HQ_Gold_ID__c=:GoldId) FROM
                                              BA_Questionnaire__c where Pref_BH_Contracting_Entity_Lookup__r.GE_HQ_Gold_ID__c =:GoldId];
   
        for(BA_Questionnaire__c ques :QuesList){
            FinalMap1.put(ques.Id,ques);
        }
        
        if(FinalMap1 != null && FinalMap1.size() > 0){
            list<BA_Questionnaire__c> FinalQuesWFList = [SELECT id,name,BA_Opportunity_Name__c, BA_Opportunity_Number__c, BA_Product_Service_Scope__c, BA_Tier_2__c, CreatedDate, CreatedBy.Name,BA_Pref_Baker_Hughes_Contracting_Entity__c, (SELECT Name,BA_Status__C,Suggested_Legal_Entity__c FROM Workflow_details__r) FROM BA_Questionnaire__c WHERE ID IN :FinalMap1.keySet()];
        	return FinalQuesWFList;
        }Else{
            return new list<BA_Questionnaire__c>();
        }
        
        
    }
    
    @AuraEnabled
    public static List<RecordsData> fetchRecords(String objectName, String filterField, String searchString, String value) {
        try {
            List<RecordsData> recordsDataList = new List<RecordsData>();
            String query = 'SELECT Id,BA_GOLD_ID__c,Name,BA_Entity__c,BA_Country_LE__c, ' + filterField + ' FROM '+objectName;
            if(String.isNotBlank(value)) {
                query += ' WHERE Id = \''+ value + '\' LIMIT 49999';
            } else {
               // query += ' WHERE '+filterField+
               //         ' LIKE ' + '\'%' + String.escapeSingleQuotes(searchString.trim()) + '%\' LIMIT 49999';
                query += ' WHERE '+filterField+
                         ' LIKE ' + '\'%' + String.escapeSingleQuotes(searchString.trim()) + '%\''+
                        ' OR BA_GOLD_ID__c'+
                        //' LIKE ' + '\'%' + String.escapeSingleQuotes(searchString.trim()) + '%\' LIMIT 49999';
                         ' LIKE ' + '\'%' + String.escapeSingleQuotes(searchString.trim()) + '%\''+
                        ' OR BA_Country_LE__c'+ 
                        ' LIKE ' + '\'%' + String.escapeSingleQuotes(searchString.trim()) + '%\' LIMIT 49999';
            }
            system.debug('Query >> ' +query);
            for(SObject s : Database.query(query)) {
                BA_Legal_Entity__c obj = (BA_Legal_Entity__c)s; 
                recordsDataList.add( new RecordsData(obj.BA_LE_Name__r.Name, (String)s.get('id'),obj.BA_GOLD_ID__c,obj.BA_Entity__c,obj.BA_Country_LE__c) );
                //recordsDataList.add( new RecordsData((String)s.get(filterField), (String)s.get('id')) );
            }
            return recordsDataList;
        } catch (Exception err) {
            if ( String.isNotBlank( err.getMessage() ) && err.getMessage().contains( 'error:' ) ) {
                throw new AuraHandledException(err.getMessage().split('error:')[1].split(':')[0] + '.');
            } else {
                throw new AuraHandledException(err.getMessage());
            }
        }
    }

    @AuraEnabled
    public static void submitLERequest(string LERequest,string recordId){
         if(LERequest != null || LERequest != ''){
             list<PermissionSetAssignment>  permissionlst = [SELECT AssigneeId,Assignee.Name,Assignee.Email,Id,PermissionSetId,PermissionSet.Name 
                                                            FROM PermissionSetAssignment where PermissionSet.Name IN ('BA_Admin')];
        	 
             BA_WorkflowDetails__c workflow =  [Select Id,Name,BA_Tax_Approver__c FROM BA_WorkflowDetails__c
                                                Where Id =: recordId];
             
             WFName = workflow.Name;
             
             list<string> adminEmailList = new list<string>();
        
            for(PermissionSetAssignment p : permissionlst){
                adminEmailList.add(p.Assignee.Email);
            }
   
        String htmlBody = '<!DOCTYPE html>' +
                         '<html>' + 
                         '<body>' +
       				'<font face="arial" size="2">' +
                         '<p>Dear BA Admin, </p>' + 
                         '<p>I am trying to add Legal Entity as a tax reviewer for ' + WFName + ' , but not able to suggest LE from available list.</p>' +
            			 '<p>Can you please add  new Legal Entity in existing data table for future submissions? </p>' +
            			 '<p>Please find below details of Requested Legal Entity </p>' +
       					 '<p> <b>'+ LERequest + '</b></p>' +
       				     '<p> Requested By :' + userinfo.getName() +  '</p>' +
       				'</body>' + 
       				'</html>' ;
        
 		// Email generation Starts here
 		OrgWideEmailAddress[] owea = [select Id from OrgWideEmailAddress where Address = 'bidadvisornotification-donotreply@bakerhughes.com'];
        List<Messaging.SingleEmailMessage> mails = new List<Messaging.SingleEmailMessage>();            
        Messaging.SingleEmailMessage semail = new Messaging.SingleEmailMessage();
                   
                    semail.setToAddresses(adminEmailList);
             		semail.setCcAddresses(new String[] { UserInfo.getUserEmail()});
                    semail.setSubject('Bid Advisor - New LE Request');
                    //String htmlBody = createEmailHtmlBody();
                    System.debug(htmlBody);
                    semail.setHtmlBody(htmlBody);
                    semail.setOrgWideEmailAddressId(owea.get(0).Id); 
                    mails.add(semail);

                if (mails.size() > 0){
                    Messaging.sendEmail(mails);  
                }          

        }
    }
    
    public class RecordsData {
        @AuraEnabled public String label;
        @AuraEnabled public String value;  
        @AuraEnabled public String BA_GOLD_ID;  
        @AuraEnabled public String LE_Name; 
        @AuraEnabled public String LE_Country;
        public RecordsData(String label, String value,String BA_GOLD_ID, String LE_Name , string LE_Country) {
            this.label = label;
            this.value = value;
            this.BA_GOLD_ID= BA_GOLD_ID;
            this.LE_Name= LE_Name;
            this.LE_Country = LE_Country;
        }
    }
}