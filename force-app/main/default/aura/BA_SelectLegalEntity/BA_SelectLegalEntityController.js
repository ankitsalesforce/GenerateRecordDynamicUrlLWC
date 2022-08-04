({
    doInit : function (component , event,helper){
        console.log(">>>"+component.get('v.recordId'));
        var usertype = component.get("v.userType");
    	var action = component.get('c.getdetails'); 
        action.setParams({
            "recId" : component.get('v.recordId') 
        });
        action.setCallback(this, function(a){
            var state = a.getState(); // get the response state
            var result =JSON.stringify(a.getReturnValue());
            console.log('result >> ' +result);
            
            if(state == 'SUCCESS') {
				 component.set('v.truthy',a.getReturnValue());
            }

        });
        $A.enqueueAction(action);
    },
    handleSave : function(component, event, helper){
        console.log("Save>>>"+component.get('v.recordId'));
        console.log('selectedObj >> ' +component.get("v.selectedDataObj"));
        /*if(component.get("v.selectedDataObj") == undefined && component.get("v.LERequest") == null){
            var toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                "title": "Error!",
                "type" : "error",
                "message": "Please select an entity or Please fill requested LE details"
            });
            toastEvent.fire();
            return;
        }*/
        if(component.get("v.selectedDataObj")){
            console.log("Save2>>>"+JSON.parse(component.get("v.selectedDataObj")).value);
            var action = component.get('c.saveData'); 
            action.setParams({
                "recId" : component.get('v.recordId'),
                "entitId" : JSON.parse(component.get("v.selectedDataObj")).value,
                
            });
            action.setCallback(this, function(a){
                var state = a.getState(); // get the response state
                if(state == 'SUCCESS') {
                    var toastEvent = $A.get("e.force:showToast");
                    toastEvent.setParams({
                        "title": "Success!",
                        "type" : "success",
                        "message": "The record has been updated successfully."
                    });
                    toastEvent.fire();
                    var dismissActionPanel = $A.get("e.force:closeQuickAction");
                    dismissActionPanel.fire();
                    $A.get('e.force:refreshView').fire();
                }
            });
            $A.enqueueAction(action);
        } else {
            var toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                "title": "Error!",
                "type" : "error",
                "message": "Please select an entity!"
            });
            toastEvent.fire();
        }
	},
    handleComponentEvent: function(component, event, helper){
        var selectedDataObj = event.getParam("selectedDataObj");
        console.log('selectedDataObj: '+ JSON.stringify(selectedDataObj));
        component.set("v.selectedDataObj", JSON.stringify(selectedDataObj));
        component.set("v.GoldId",selectedDataObj.BA_GOLD_ID);
        console.log('Gold Id >> ' ,component.get("v.GoldId"));
        
        if(component.get("v.GoldId") != undefined || component.get("v.GoldId") != null){
            var action = component.get("c.getSimilarLE");
            action.setParams({
            "GoldId" : component.get('v.GoldId')
            });
        action.setCallback(this, function(a){
            var state = a.getState(); 
			if(state == 'SUCCESS') {
                component.set("v.isSimilarLEFound",true);
				  console.log('Succes >> ' ,a.getReturnValue());
            }
            

        });
        $A.enqueueAction(action);
            
        }
    },
    
    handleClickHere : function(component, event, helper){
        component.set("v.missingLE",true);
        component.set("v.defaultView",false);
    },
    
    handleLERequest :  function(component, event, helper){
        console.log('LERequest >> ' +component.get("v.LERequest"));
        if(component.get("v.LERequest") == null || component.get("v.LERequest") == ''  || 
          component.get("v.LERequest") == undefined ){
                var toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    "title": "Info!",
                    "type" : "info",
                    "message": "Please first add requested LE details"
                });
                toastEvent.fire();
                return;
        }
        
        var action = component.get('c.submitLERequest'); 
        action.setParams({
            "LERequest" : component.get('v.LERequest'),
            "recordId" : component.get('v.recordId')
        });
        action.setCallback(this, function(a){
            var state = a.getState(); 
			if(state == 'SUCCESS') {
				  var toastEvent = $A.get("e.force:showToast");
                    toastEvent.setParams({
                        "title": "Success!",
                        "type" : "success",
                        "message": "New LE Request submitted to admin successfully ..!!",
                        "duration" : 6000
                        
                    });
                    toastEvent.fire();
                	$A.get("e.force:closeQuickAction").fire();
            }
            

        });
        $A.enqueueAction(action);
    },
    
    handleCheckbox :  function(component, event, helper){
        var checkboxEvent = event.getSource().get("v.checked");
        var checkBoxName = event.getSource().get("v.name");
        if(checkBoxName){
            if(checkBoxName === 'LE')
                component.set("v.LERequired", true);
        }
        
        var action = component.get('c.updateLECheckBox'); 
        action.setParams({
            "LERequired" : component.get('v.LERequired'),
            "recordId" : component.get('v.recordId')
        });
        action.setCallback(this, function(a){
            var state = a.getState(); 
			if(state == 'SUCCESS') {
				  console.log('New LE/Branch checked successfully..!!')
            }
            

        });
        $A.enqueueAction(action);
    },
    
    handleCancel : function(component, event, helper){
        $A.get("e.force:closeQuickAction").fire();
    },
    handleSimilarLE : function(component,event,helper){
        console.log('Similar LE Request clicked');
    }
})