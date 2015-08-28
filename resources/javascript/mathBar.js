var selectMoreText = "more";
var functions;

//VIF - Very Importatnt Function
function MathBar( outputID, numberOfVIF, button, callback ) {
    var self = this;
    
    self.outputID = outputID;
    self.functions = functions["func_one_variable"];
    self.button = button;
    self.currentOption = 0;
    self.currentOptionVIF = true;
    self.callback = callback;
    self.visible = false;
    self.outputValue = $("#" + outputID)[0].yacasExpression;
    
    var $mathBarElement = $( "<div>" , { class: "MathBar" } ).hide();
    var $functionsDiv = $("<div>", {class : "radio_group_horizontal styled_radio"});
    
    //In case number of all functions is 1 more than VIF do not display combobox with only one function
    //but treat all of them as VIFs
    
    if ( numberOfVIF > self.functions.length ) numberOfVIF = self.functions.length;
    
    if ( self.functions.length - numberOfVIF == 1 ){
        numberOfVIF++;
    }
    
    for( i = 0; i < numberOfVIF; i++){
        $input = $("<input>", { type: "radio", name: outputID, value: self.functions[i]["functionName"]})
        
        if ( i == 0 ) $input.prop( "checked", true );
        
        $input.click( function(){ self.optionClicked( this.value, true )});
        
        $span = $("<span>").append( self.functions[i]["functionName"]);
        
        $label = $("<label>");
        $label.append( $input );
        $label.append( $span );
        
        $functionsDiv.append( $label );
    }
    
    if ( i != self.functions.length ){
    
        var $functionsSelect = $("<select>");
    
        $functionsSelect.append( $("<option>").append( selectMoreText ));
    
        for( i = numberOfVIF; i < self.functions.length; i++){
            $functionsSelect.append( $("<option>").append( self.functions[i]["functionName"]) );
        }
    
        $functionsDiv.append( $("<label>").append($functionsSelect ));
        
    }
    

    
    $submitButton = $("<button>", {class: "submitButton"} );
    $submitButton.click( function(){ self.Run() });
    
    
    $mathRow = $("<tr>");
    $mathRow.append( $("<td>", {class: "functions"}).append($functionsDiv) );
    $mathRow.append( $("<td>", {class: "separator"}));
    $mathRow.append( $("<td>", {class: "parameters"}).append( $("<div>", {class: "parameters"})));
    $mathRow.append( $("<td>", {class: "submitButton"}).append( $submitButton ));
    

    $mathBarTable = $("<table>").append( $mathRow );
    
    $( "#" + self.outputID ).after( $mathBarElement.append( $mathBarTable ));

    self.mathBarElement = $mathBarElement;
    
    self.Show();
    $functionsDiv.parent().width( $functionsDiv.width() - 4);

    self.optionClicked( self.functions[0]["functionName"], true );
    
    
    if ( $functionsSelect ){
        $functionsSelect.selectmenu();
        $functionsSelect.on( "selectmenuselect", function( event, ui ) { self.optionClicked( this.value, false )} );
    }

};

MathBar.prototype.optionClicked = function( functionName, VIF ){
    
    if ( self.currentOptionVIF && functionName == selectMoreText ) return;
    self.currentOptionVIF = VIF;
    
    var $parametersElement = $(this.mathBarElement).find(".parameters");
    $parametersElement.html("");
    
    if ( functionName == selectMoreText ) return;
    
    if ( !VIF ){
        $(this.mathBarElement).find( "input:checked" ).prop("checked", false);
        $(this.mathBarElement).find( "select").parent().addClass("checked");
    }else{
        $(this.mathBarElement).find( "select").parent().removeClass("checked");
    }
    
    console.log( "Option clicked: " + functionName ) ;
    
    for( i = 0; i < this.functions.length; i++ ){
        if( this.functions[i]["functionName"] == functionName ){
            var parameters = this.functions[i]["parameters"];
            break;
        }
    }
    this.currentOption = i;
    
    
    for ( i = 0; i < parameters.length; i++ ){
        $parametersElement.append( this.getPropertyLabel( parameters[i]) );
    }
    
};

MathBar.prototype.getPropertyLabel = function( parameter ){
    var $label = $("<label>");
    
    if ( parameter["parameterType"] == "edit"){
        defaultValue = parameter["defaultValue"];
        
        $input = $("<input>", {type: "text", name: parameter["parameterName"]});
        $input.attr( "size", defaultValue.length*5 );
        $input.val( defaultValue );
        
        $label.append( parameter["parameterName"] + ": ");
        $label.append( $input );
    }
    
    
    if ( parameter["parameterType"] == "checkbox"){
        
        $input = $("<input>", {type: "checkbox", name: parameter["parameterName"] });
        $input.prop( "checked", parameter["defaultValue"]);
        $label.append( $input );
        $label.append( parameter["parameterName"]);
    }
    
    if ( parameter["parameterType"] == "condition"){
        $input = $("<input>", {type: "checkbox", name: parameter["parameterName"] });
        
        if ( parameter["defaultValue"] == "true" ){
            checked = true;
        }else{
            checked = false;
        }
        
        $input.change( function(){
                      if( $(this).is(":checked")){
                        enableParameters( parameter["parameterName"] );
                      }else{
                        disableParameters( parameter["parameterName"] );
                      }
                      });
        

        $input.prop( "checked", checked );
        $label.append( $input );
        $label.append( parameter["parameterName"]);
        
        conditionalParameters = parameter["parameters"];
        var $outerlabel = $("<span>").append( $label );
        
        for ( i = 0; i < conditionalParameters.length; i++ ){
            $condparLabel = this.getPropertyLabel( conditionalParameters[i]);
            $condparLabel.addClass( "check_" + parameter["parameterName"]);
            
            if ( !checked ){
                $condparLabel.addClass( "labelDisabled" );
                $condparLabel.find("input").prop( "disabled", true );
            }
            
            $outerlabel.append( $condparLabel );
        }
        
        
        $label = $outerlabel;

    }
    
    return $label;
    
};

function disableParameters( parameterName ){
    $label =  $(".check_" + parameterName ).addClass( "labelDisabled" );
    $label.find("input").prop( "disabled", true );
}

function enableParameters( parameterName ){
    $label =  $(".check_" + parameterName ).removeClass( "labelDisabled" );
    $label.find("input").prop( "disabled", false );
}


MathBar.prototype.GetPropertyValue = function( parameter, outValues ){
    type = parameter["parameterType"];
    parameterName = parameter["parameterName"];
    
    if ( type == "edit" ){
        outValues[ parameterName ] = this.mathBarElement.find( "[name='" + parameterName + "']:first" ).val();
    }
    if ( type == "checkbox" ){
        outValues[ parameterName ] = this.mathBarElement.find( "[name='" + parameterName + "']:first" ).prop("checked");
    }
    
    if ( type == "condition" ){
        outValues[ parameterName ] = this.mathBarElement.find( "[name='" + parameterName + "']:first" ).prop("checked");
        conditionalParameters = parameter["parameters"];
        for ( i = 0; i < conditionalParameters.length; i++ ){
          this.GetPropertyValue( conditionalParameters[i], outValues );
        }
    }

    
}

MathBar.prototype.Run = function(){
    
    var parameters = this.functions[this.currentOption]["parameters"];
    var outValues = [];
    
    for ( i = 0; i < parameters.length; i++ ){
        this.GetPropertyValue( parameters[i], outValues );
    }
    
    var parser = this.functions[this.currentOption]["parser"];
    result = window[parser](this.outputValue, outValues);
    
    this.callback( result );
    this.Remove();
}

MathBar.prototype.Remove = function(){
    this.button.mathBar = null;
    this.mathBarElement.slideUp(300, function(){ this.remove() ;} );
    $(this.button).removeClass("up");
}

MathBar.prototype.Show = function(){
    this.visible = true;
    this.mathBarElement.slideDown(300);
    $(this.button).addClass("up");
}

MathBar.prototype.Hide = function(){
    this.visible = false;
    this.mathBarElement.slideUp(300);
    $(this.button).removeClass("up");
}

MathBar.prototype.Toggle = function(){
    if ( this.visible ) this.Hide();
    else this.Show();
    
}

MathBar.initializeFunctions = function(jsonfile){
    
    $.getJSON( "javascript/functions.json", function( data ) {
              functions = data["functions"];
              console.log( functions );
              });
}

