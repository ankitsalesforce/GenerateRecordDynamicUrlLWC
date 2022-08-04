import { LightningElement,track,api, wire } from 'lwc';
import getSimilarLE from '@salesforce/apex/BA_CustomLookUpReviwer.getSimilarLE';
import { NavigationMixin } from 'lightning/navigation';

export default class BA_similarLERequest extends NavigationMixin(LightningElement) {

    @track getSimilarLEList=[]
    @track loader = false
    @api GoldId
    @api recordId
    @track getWorkflowList = []
    wfrecordPageUrl
    quesrecordPageUrl
    similarLEFound = false
    viewform=false

    @wire(getSimilarLE,{GoldId:'$GoldId',recordId:'$recordId'}) 
    accountsData({ error, data }) {
        console.log('GoldId >> ' ,this.GoldId)
        console.log('RecordId >> ',this.recordId)
        this.loader = true;
        if(data){
            console.log(data);
            //console.log('Stringfy data',JSON.stringify(data));
            this.loader = false;
            this.getSimilarLEList = data

            if(this.getSimilarLEList.length > 0 && this.getSimilarLEList  !== 'undefined'){
                this.similarLEFound = true
            }else{
                this.similarLEFound = false
            }
            
        }
        if(error){
            console.error(error)
        }
    }
    

    handleWFClick(event){
        const recordId = event.target.dataset.workid;
        this[NavigationMixin.GenerateUrl]({
            type: 'standard__recordPage',
            attributes: {
                objectApiName:"BA_Workflow_Details__c",
                actionName: "view",
                recordId: recordId
            }
        }).then((url)=>{
            this.wfrecordPageUrl = url;
        });
    }

    handleQuesClick(event){
         this.viewform=true
        const recordId = event.target.dataset.quesid;
        this[NavigationMixin.GenerateUrl]({
            type: 'standard__recordPage',
            attributes: {
                objectApiName:"BA_Questionnaire__c",
                actionName: "view",
                recordId: recordId
            }
        }).then((url)=>{
            this.quesrecordPageUrl = url;
          
        });
        // this[NavigationMixin.Navigate]({
        //     "type": "standard__component",
        //     "attributes": {
        //         "componentName": "c__BA_DLE_WF", 
        //     },
        //     state: {
        //         c__recordId: recordId
        //     }
        // });
    }


}