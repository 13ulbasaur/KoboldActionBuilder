document.getElementById('btnAddRoll').onclick = function(){addRoll()}; 
var rolls = document.getElementById('rolls');
var nextRow = 0;
var rollList = [];
//Get the roll modal
const addRollModal = new bootstrap.Modal('#addRollModal', {
});
//And the roll modal element
const addRollModalElement = document.getElementById('addRollModal')

$('#actionForm').on('change','input, select, textarea', function() {
    buildJson();
})

function buildJson() {
    var jsonObject = {};
    jsonObject.name = $('#actionName').val();
    jsonObject.type = $('#type').val();
    jsonObject.actionCost = $('#actionCost').val();
    jsonObject.autoHeighten = $('#autoHeighten').is(":checked");
    
    jsonObject.description = $('#description').val();
    const baseLevel = $('#baseLevel').val();
    if (baseLevel != '') {
        jsonObject.baseLevel = parseInt(baseLevel);
    }
    const tags = $('#tags').val();
    //Split string into array by commas
    jsonObject.tags = tags.split(',').map(function(item) {
        return item.trim();
    });

    jsonObject.rolls = rollList.map(({id, ...rest}) => {
        return rest;
    });
    $('#result').val(JSON.stringify([jsonObject]));
}

//When actiontype is changed, show the respective section and hide the others.
$('#actionType').on('change',(e) => {
    const sectionTarget = (e.target.value == "attack" || e.target.value == "skill-challenge" ? "attack-skill-section" : e.target.value + "-section")
    // //Hide whatever is currently showing
    $('.rollSections').each(function(index, loopelement) {
        //Hide items that are visible that does not match target
        if (!$(this).hasClass(sectionTarget) && $(this).css('display') != 'none') {
            $(this).hide();
        }
        //Show items that are hidden that does match target
        else if ($(this).hasClass(sectionTarget) && $(this).css('display') === 'none') {
            $(this).show();
        }
    });
});

//open the roll modal element
function addRoll() {
    addRollModal.show();
}

//Wjen the roll modal opens...
addRollModalElement.addEventListener('show.bs.modal', e => {
    //Make it smol again
    let modalDialog = $('#addRollModal .modal-dialog')
    modalDialog.removeClass('modal-lg')
    //Switch back to the roll tab. 
    const bsTab = new bootstrap.Tab('#roll-tab')
    bsTab.show();

    //If the event has a related target, that means that the edit button called the modal. 
    if (e.relatedTarget != null) {
        $("#roll-tab").text('Edit Roll');
        $("#btnSubmitRoll").text('Edit Roll');
        const itemID = e.relatedTarget.closest('div.accordion-item').data("target");
        $("#rollID").val(itemID);

        //Get the list object
        const rollItem = rollList.find(item => item.id === itemID);
        //Populate modal fields
        for (const property in rollItem) {
            //name field has a different name
            if (property === 'name') {
                $('#rollTypeName').val(rollItem[property])
            }
            //as does type field
            else if (property === 'type') {
                $('#actionType').val(rollItem[property])
            }
            //tags needs to be parsed back as a string
            else if (property === 'extraTags') {
                $('#extraTags').val(rollItem[property].join(', '));
            }
            else {
                let input = $('#' + property)
                //In the input is a checkbox, do different stuff.
                if (input.attr('type') === 'checkbox') {
                    input.prop('checked',rollItem[property]);
                }
                //Otherwise just chuck in the value.
                else {
                    input.val(rollItem[property]);
                }
            }
        }
    }
    //If no related target, that means it's a new roll, so set the text
    else {
        $("#roll-tab").val('Add Roll');
        $("#btnSubmitRoll").val('Add Roll');
    }
    //Trigger the onchange to reset displayed fields
    $('#actionType').change();
})


//Wjen the roll modal is fully opened...
addRollModalElement.addEventListener('shown.bs.modal', event => {
    //Set the name field as focus
    $('#rollTypeName').focus()
})


//When the roll modal is fully closed...
addRollModalElement.addEventListener('hidden.bs.modal', e => {
    //Reset the form
    document.getElementById("rollForm").reset(); 
})

//When the add roll button is clicked in the modal...

$("#btnSubmitRoll").click(function() {
    const invalidItems = $('#rollForm').find('input:invalid').filter(':visible');
    if (invalidItems.length > 0) {
        return false;
    }
    let rollObject = {};
    let itemHTML = '';
    //Get the name
    rollObject.name = $('#rollTypeName').val().trim();

    //Check if this is an edit or an add. If the index is -1, then it's an add. 
    const itemID = $('#rollID').val();
    console.log(itemID);
    let rollIndex = -1
    if (itemID != '') {
        rollIndex = rollList.findIndex(obj => {
            return obj.id === itemID
        })
    }
    const isEdit = rollIndex > -1 

    console.log(`Is Edit: ${isEdit}`);

    //Check if the name already exists, and reject input if so. 
    const nameExists = rollList.some(obj => {
        return (obj.name.toLowerCase() === rollObject.name.toLowerCase() && obj.id != itemID)
    })
    if (nameExists === true) {
        $('#duplicateNameWarning').show();
        return false;
    }
    else {
        $('#duplicateNameWarning').hide();
    }
    //Get which type was selected.
    const type = $('#actionType').val()
    rollObject.type = type;
    itemHTML = '<b>Type: </b>' + type;

    //Get all of the sections of that type.
    const sectionTarget = (type == "attack" || type == "skill-challenge" ? "attack-skill-section" : type + "-section")
    $('.' + sectionTarget + ' > input, .' + sectionTarget + ' > textarea').each(function(index, loopelement) {
        // let thisInput = $(this).children('input,textarea,').
        // console.log(thisInput);
        let thisID = $(this).attr('id');
        //Add each item to the object using the id name as the property name
        //But if it is the tags box then we will create an array.
        if (thisID === 'extraTags') {
            if ($(this).val() != '') {
                //Split string into array by commas
                rollObject.extraTags = $(this).val().split(',').map(function(item) {
                    return item.trim();
                });
                itemHTML += '<br><b>Extra Tags: </b>' + $(this).val();
            }
            else {
                rollObject.extraTags = [];
            }
        }
        //Or if it is a checkbox, we get false/true
        else if ($(this).attr('type') === 'checkbox') {
            rollObject[$(this).attr('id')] = $(this).is(":checked");
            itemHTML += '<br><b>' + $(this).siblings('label:first').find('span.itemName').text() + ': </b>' + $(this).is(":checked");
        }
        else 
        {
            if ($(this).val() != '') {
                rollObject[$(this).attr('id')] = $(this).val();
                itemHTML += '<br><b>' + $(this).siblings('label:first').find('span.itemName').text() + ': </b>' + $(this).val();
            }
        }
    });

    //If it is edit..
    if (isEdit === true) {
        //Replace that object with the new one.
        rollObject.id = itemID;
        rollList[rollIndex] = rollObject;
        //Find the accordion item with that id and then edit the body of that. 
        $('#' + itemID + '>.accordion-body').html(itemHTML)

        //And edit the header...
        $('[data-bs-target="#' + itemID + '"]').text(rollObject.name);
    }
    //If it is add...
    else {
        //Add the object to the rolls List
        addRollToList(rollObject, itemHTML);
    }
    buildJson();
    //Close the form
    addRollModal.hide();
})

function addRollToList(rollObject,itemHTML) {
    //Get the number of current items in list.
    const itemID = 'rollItem' + nextRow;
    nextRow++;
    rollObject.id = itemID;
    rollList.push(rollObject);
    
    //Loop through each attribute in the object 
    $('#rollsList').append('<div class="accordion-item" data-target="' + itemID + '">' +
    '<h2 class="accordion-header">' +
        '<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#' + itemID + '" aria-expanded="false" aria-controls="' + itemID + '">' + rollObject.name + '</button>' +
        '<div class="accordionButtons">' +
            '<button class="btn btn-outline-light editRoll" type="button" title="Edit Roll"><i class="bi bi-pencil-square"></i></button>' +
            '<button class="btn btn-outline-danger deleteRoll" type="button" title="Delete Roll"><i class="bi bi-trash"></i></button>' +
        '</div>' +
    '</h2>' +
    '<div id="' + itemID + '" class="accordion-collapse collapse " data-bs-parent="#rollsList">' +
        '<div class="accordion-body">' +
        itemHTML +
        '</div>' +
    '</div>' +
    '</div>')
}

$('#rollsList').on('click', '.editRoll', function() {
    //Pass in the edit button that was clicked so that the modal can reference it.
    addRollModal.show($(this));
});

$('#rollsList').on('click', '.deleteRoll', function() {
    const item = $(this).closest('div.accordion-item')
    if (window.confirm("Are you sure you want to delete the roll " + item.find('.accordion-button').text() + "?")) {
        //Get the ID of this item and delete it from the roll List. 
        //Find item in roll list and delete
        const itemID = item.data("target");
        rollList = rollList.filter(item => item.id !== itemID);

        //Delete the item from accordion
        item.remove();
    }
    buildJson();
}); 

//Hide the submit button in the roll modal if not on the roll tab 
$('button[data-bs-toggle="tab"]').on("click",function(){
    let modalDialog = $('#addRollModal .modal-dialog')
    if (this.id === 'roll-tab') {
        modalDialog.removeClass('modal-lg')
        $('#btnSubmitRoll').show()
    }
    else {
        modalDialog.addClass('modal-lg')
        $('#btnSubmitRoll').hide()
        if (this.id === 'reference-tab') {
            $('#attributesTables').masonry({
                itemSelector: '.col-sm-6',
                horizontalOrder: false
            });
        }
    }
 });