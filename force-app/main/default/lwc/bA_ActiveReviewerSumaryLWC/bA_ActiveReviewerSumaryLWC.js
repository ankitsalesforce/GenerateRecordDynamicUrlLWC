import { LightningElement, wire, api, track  } from 'lwc';
import getReviewerList from '@salesforce/apex/BA_ActiveReviewerSummary.getReviewerList';
import {exportCSVFile} from 'c/bA_ExportCSVUtilityLWC'

export default class BA_ActiveReviewerSumaryLWC extends LightningElement {
    @track loader = false;
    @track error = null;
    @track pageSize = 10;
    @track pageNumber = 1;
    @track totalRecords = 0;
    @track totalPages = 0;
    @track recordEnd = 0;
    @track recordStart = 0;
    @track isPrev = true;
    @track isNext = true;
    @track reviewerList=[];
    activeFiltervalue = 'select';
    selectPage = 10;
    //On load
    connectedCallback() {
        this.getReviewerList();
       
    }
 
    //handle next
    handleNext(){
        this.pageNumber = this.pageNumber+1;
        this.getReviewerList();
    }
 
    //handle prev
    handlePrev(){
        this.pageNumber = this.pageNumber-1;
        this.getReviewerList();
    }
 
    //get reviewerlist
    getReviewerList(){
        this.loader = true;
        getReviewerList({pageSize: this.pageSize, pageNumber : this.pageNumber,userSelect:this.activeFiltervalue})
        .then(result => {
            this.loader = false;
            if(result){
                var resultData = JSON.parse(result);
                console.log('responseVal >>>' ,result);
                //console.log('total Records >>>' ,resultData.totalRecords);
                
                this.reviewerList = resultData.recordlst;
                this.pageNumber = resultData.pageNumber;
                this.totalRecords = resultData.totalRecords;
                this.recordStart = resultData.recordStart;
                this.recordEnd = resultData.recordEnd;
                this.totalPages = Math.ceil(resultData.totalRecords / this.pageSize);
                this.isNext = (this.pageNumber == this.totalPages || this.totalPages == 0);
                this.isPrev = (this.pageNumber == 1 || this.totalRecords < this.pageSize);
            }
        })
        .catch(error => {
            this.loader = false;
            this.error = error;
            console.error(error)
        });
    }
 
    get Activeoptions(){
        return [
            {label:"Active",value: "true"},
            {label:"InActive",value:"false"},
        ] 
    }

    get selectPageoptions(){
        return [
            {label:"10",value: "10"},
            {label:"20",value:"20"},
            {label:"30",value:"30"},
        ] 
    }
    
    activeHandleChange(event){
        this.activeFiltervalue= event.target.value
        console.log('selected value >>' ,this.activeFiltervalue)
        this.getReviewerList();
    }

    selectPagehandleChange(event){
        this.pageSize = event.target.value
        this.getReviewerList();
        console.log('selected page size >>> ' ,this.pageSize )
    }

    headers = {
        assigneeName:"Name",
        assigneeEmail:"Email",
        assigneeLastLogin:"Last Login Date",
        isActiveReviewer : "IsActive"
    }

    downloadCsv(){
        console.log('download csv triggered')
        exportCSVFile(this.headers, this.reviewerList, "Reviewer Detail")
    }

    //display no records
    get isDisplayNoRecords() {
        var isDisplay = true;
        if(this.reviewerList){
            if(this.reviewerList.length == 0){
                isDisplay = true;
            }else{
                isDisplay = false;
            }
        }
        return isDisplay;
    }
}