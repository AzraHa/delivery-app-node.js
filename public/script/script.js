function addToCart(id,restaurantID) {
  $.ajax({
      url: "/users/add-order/" + id + "/restaurant/" + restaurantID,
      method: "POST",
      success: function (result) {
      }
    })
}
function deleteFromOrder(orderID,foodID){
  $.ajax({
    url: "/users/order/" + orderID + "/"+foodID,
    method: "DELETE",
    success: function (result) {
      $('#'+orderID+'').remove();
    }
  })
}
function endOrder(id){
  $.ajax({
    url:"/supplier/active-order/"+id,
    method: "POST",
    success: function(data){
      setTimeout(function(){
        $('#'+id+'').remove();
        location.reload();
      }, 30);
    }
  });
}
function datum(){
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1;
  var yyyy = today.getFullYear();
  if(dd<10){
    dd='0'+dd
  }
  if(mm<10){
    mm='0'+mm
  }
  today = yyyy+'-'+mm+'-'+dd+'T'+'00:00';
  document.getElementById("vrijeme").setAttribute("min", today);
}
function datumSale(){
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1;
  var yyyy = today.getFullYear();
  if(dd<10){
    dd='0'+dd
  }
  if(mm<10){
    mm='0'+mm
  }
  today = yyyy+'-'+mm+'-'+dd;
  document.getElementById("date1").setAttribute("min", today);
  document.getElementById("date2").setAttribute("min", today);
}
function deleteFood(id){
  $.ajax({
    url:"/adminRestaurant/food/delete/" + id,
    method: "DELETE",
    success: function(result){
      $('#'+id+'').remove();
    }
  });
}
function deleteFoodMenu(id){
  $.ajax({
    url:"/adminRestaurant/menu/delete/" + id,
    method: "DELETE",
    success: function(result){
      $('#'+id+'').remove();
    }
  });
}
function deleteSale(id){
  $.ajax({
    url:"/adminRestaurant/sale/delete/" + id,
    method: "DELETE",
    success: function(result){
      $('#'+id+'').remove();
    }
  });
}
function deleteSupplier(id){
  $.ajax({
    url:"/adminRestaurant/suppliers/delete/" + id,
    method: "DELETE",
    success: function(result){
      $('#'+id+'').remove();
    }
  });
}
function deleteAdmin(id){
  $.ajax({
    url:"/admin/admins/delete/" + id,
    method: "DELETE",
    success: function(result){
      $('#'+id+'').remove();
    }
  });
}
function deleteFoodAdmin(id){
  $.ajax({
    url:"/admin/food/delete/" + id,
    method: "DELETE",
    success: function(result){
      $('#'+id+'').remove();
    }
  });
}
function deleteFoodType(id){
  $.ajax({
    url:"/admin/foodType/" + id,
    method: "DELETE",
    success: function(result){
      $('#'+id+'').remove();
    }
  });
}
function deleteRestaurantType(id){
  $.ajax({
    url:"/admin/restaurantType/" + id,
    method: "DELETE",
    success: function(result){
      $('#'+id+'').remove();
    }
  });
}
function deleteSupplierAdmin(id){
  $.ajax({
    url:"/admin/suppliers/delete/" + id,
    method: "DELETE",
    success: function(result){
      $('#'+id+'').remove();
    }
  });
}
function removeSupplierAdmin(restoran,id){
  $.ajax({
    url:"/admin/suppliers/remove/" + id+"/"+restoran,
    method: "POST",
    success: function(result){
      $('#'+id+'').remove();
    }
  });
}
function deleteRestaurant(id){
  $.ajax({
    url:"/admin/restaurant/delete/" + id,
    method: "DELETE",
    success: function(result){
      $('#'+id+'').remove();
    }
  });
}
function removeItem(id,food){
  $.ajax({
    url:"/adminRestaurant/menu/deleteItem/" + id +"/"+ food,
    method: "DELETE",
    success: function(result){
      $('#'+food+'').remove();
    }
  });
}

