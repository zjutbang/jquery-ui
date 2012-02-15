(function( $ ) {

module( "property" );

function create() {
	return {
		name: "Peter"
	};
}

test( "key, value", function() {
	expect(3);
	var object = create();
	$.observable( object ).bind( "change", function(event, ui) {
		deepEqual( ui.oldValues, { name: "Peter" } );
		deepEqual( ui.newValues, { name: "Pan" } );
	}).property( "name", "Pan" );
	equal( object.name, "Pan" );
});

}( jQuery ) );
