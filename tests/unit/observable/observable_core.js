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

test( "key, value on array", function() {
	var object = [ 1, 2, 3, 4, 5 ];
	$.observable( object ).bind( "change", function(event, ui) {
		deepEqual( ui.oldValues, { 2: 3 } );
		deepEqual( ui.newValues, { 2: 88 } );
	}).property( 2, 88 );
	equal( object[2], 88 );
});

}( jQuery ) );
