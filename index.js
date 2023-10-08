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
    console.log('Change: ' + this.name);
    buildJson();
})

function buildJson() {
    var jsonObject = {};
    jsonObject.name = $('#actionName').val();
    jsonObject.type = $('#type').val();
    jsonObject.actionCost = $('#actionCost').val();
    jsonObject.autoHeighten = $('#autoHeighten').is(":checked");
    //only build other things if not empty
    const description = $('#description').val();
    if (description != '') {
        jsonObject.description = description;
    }
    const baseLevel = $('#baseLevel').val();
    if (baseLevel != '') {
        jsonObject.baseLevel = baseLevel;
    }
    const tags = $('#tags').val();
    if (tags != '') {
        //Split string into array by commas
        jsonObject.tags = tags.split(',').map(function(item) {
            return item.trim();
        });
    }
    if (rollList.length > 0) {
        jsonObject.rolls = rollList;
    }
    console.log(jsonObject);
    $('#result').val(JSON.stringify(jsonObject));
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
addRollModalElement.addEventListener('show.bs.modal', event => {
    //Trigger the onchange to reset displayed fields
    $('#actionType').change();
})

//When the roll modal is fully closed...
addRollModalElement.addEventListener('hidden.bs.modal', e => {
    console.log(e);
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
    rollObject.name = $('#rollTypeName').val();
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
        }
        //Or if it is a checkbox, we get false/true
        else if ($(this).attr('type') === 'checkbox') {
            rollObject[$(this).attr('id')] = $(this).is(":checked");
            itemHTML += '<br><b>' + $(this).siblings('label:first').text() + ': </b>' + $(this).is(":checked");
        }
        else 
        {
            if ($(this).val() != '') {
                rollObject[$(this).attr('id')] = $(this).val();
                itemHTML += '<br><b>' + $(this).siblings('label:first').text() + ': </b>' + $(this).val();
            }
        }
    });

    console.log(rollObject);

    //Add the object to the rolls List
    addRollToList(rollObject, itemHTML);
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
    console.log(rollList);
    
    //Loop through each attribute in the object 
    $('#rollsList').append('<div class="accordion-item">' +
    '<h2 class="accordion-header">' +
        '<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#' + itemID + '" aria-expanded="false" aria-controls="' + itemID + '">' + rollObject.name + '</button>' +
    '</h2>' +
    '<div id="' + itemID + '" class="accordion-collapse collapse " data-bs-parent="#rollsList">' +
        '<div class="accordion-body">' +
        itemHTML +
        '</div>' +
    '</div>' +
    '</div>')
}
//Do stuff