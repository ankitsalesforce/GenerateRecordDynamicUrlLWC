import { LightningElement, wire,track } from 'lwc';
import getReviewer from '@salesforce/apex/BA_ActiveReviewerSummary.getReviewer';
import {exportCSVFile} from 'c/bA_ExportCSVUtilityLWC';
import {NavigationMixin} from 'lightning/navigation'



export default class BA_ReviewerUserLWC extends NavigationMixin(LightningElement) {
    headings=["Name","Email","Role","Last Login Date","IsActive"]
    fullTableData = []
    filteredData = []
    AllFilterTableData=[] 
    timer
    filterBy = "assigneeName"
    sortedBy="assigneeName"
    sortedDirection = 'asc'

    @wire(getReviewer)
    ReviewerHandler({data,error}){
        if(data){
            console.log(data)
            
            var resultData = JSON.parse(data);
            this.AllFilterTableData = resultData
            console.log('responseVal >>>' ,resultData);
            this.filteredData = resultData.recordlst
            this.fullTableData = resultData.recordlst
            this.filteredData= [...this.sortBy(resultData.recordlst)]

        }if(error){
            console.log(error)
        }
    }

    get FilterByValue(){
        return [
            {label:"All",value:"All"},
            {label:"Name",value:"assigneeName"},
            {label:"Email",value:"assigneeEmail"},
            {label:"Role",value:"assigneeRole"}
        ]
    }

    get sortedByValue(){
        return [
            {label:"Name",value:"assigneeName"},
            {label:"Email",value:"assigneeEmail"},
            {label:"Role",value:"assigneeRole"},
            {label:"IsActive",value:"isActiveReviewer"}
        ]
    }

    filterByHandler(event){
        this.filterBy = event.target.value
    }

    filterHandler(event){
        const {value} = event.target
        window.clearTimeout(this.timer)
        if(value){
            this.timer = window.setTimeout(()=>{
                console.log('VALUE',value.toString());

                  
                this.filteredData = this.fullTableData.filter(eachObj=>{
                if(this.filterBy === 'All'){
                        return Object.keys(eachObj).some(key=>{
                            
                            const val = eachObj[key]
                            if(typeof val === 'boolean'){
                                console.log('true or false >> ',val.toString().toLowerCase().includes(value))
                                //return false
                                return val.toString().toLowerCase().includes(value);
                            }else{
                                console.log('Eachobj Key >>' ,eachObj[key])
                                if(eachObj[key] === null){
                                    return false
                                }else{
                                    return eachObj[key].toLowerCase().includes(value);
                                }
                                
                            }
                                
                            
                        })
                     }
                    else{
                        const val = eachObj[this.filterBy] ? eachObj[this.filterBy] :''
                        return val.toLowerCase().includes(value);
                    }
                  })
            },500)
            
        }else{
            this.filteredData = [...this.fullTableData];
        }
    }

    sortHandler(event){
        this.sortedBy = event.target.value
        this.filteredData = [...this.sortBy(this.filteredData)]
    }

    sortBy(data){
        
        const cloneData = [...data]
        cloneData.sort((a,b)=>{
            if(a[this.sortedBy] === b[this.sortedBy]){
                return 0
            }
            return this.sortedDirection === 'desc'?
            a[this.sortedBy] > b[this.sortedBy] ? -1:1 :
            a[this.sortedBy] < b[this.sortedBy] ? -1:1
        })

        return cloneData
    }

    headers = {
        assigneeName:"Name",
        assigneeEmail:"Email",
        assigneeRole:"Role",
        assigneeLastLogin:"Last Login Date",
        isActiveReviewer : "IsActive"
    }

    downloadCsv(){
       exportCSVFile(this.headers, this.fullTableData, "BA Reviewer Details")
    }
}