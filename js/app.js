//BUDGET CONTROLLER
var budgetController = (function(){
	
	var Expense = function(id, description, value){
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};

	Expense.prototype.calculatePercentage = function(totalIncome){
		if(totalIncome > 0){
			this.percentage = Math.round((this.value / totalIncome) * 100);
		} else {
			this.percentage = -1;
		}
	};

	Expense.prototype.getPercentage = function(){
		return this.percentage;
	};

	var Income = function(id, description, value){
		this.id = id;
		this.description = description;
		this.value = value;
	};

	var calculateTotal = function(type){
		var sum = 0;
		data.allItems[type].forEach(function(element){
			sum += element.value;
		});
		data.totals[type] = sum;
	}

	var data = {
		allItems:{
			expense: [],
			income: []
		}, 
		totals: {
			expense: 0,
			income: 0
		},
		budget: 0,
		percentage:-1
	};

	return {
		addItem: function(type, des, val){
			var newItem, ID;
			//[1 2 3 4 5], next ID = 6
			//[1 2 4 6 8], next ID = 9

			//Create new ID
			if(data.allItems[type].length >0){
				ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
			} else {
				ID = 0;
			}
			//Create new item based on 'income' or 'expense' type 
			if(type === 'expense'){
				newItem = new Expense(ID, des, val);
			} else if(type === 'income') {
				newItem = new Income(ID, des, val);
			}
			// Push it into our data structure
			data.allItems[type].push(newItem);

			// Return the new Element
			return newItem;
		},

		deleteItem: function (type, id){
			var ids, index;
			
			ids = data.allItems[type].map(function(element){
				return element.id;
			});

			index = ids.indexOf(id);

			if(index !== -1){
				data.allItems[type].splice(index, 1);
			}
		},

		calculateBudget: function(){

			// calculate total income and expenses
			calculateTotal('expense');
			calculateTotal('income');
			// Calculate the budget: income - expenses
			data.budget = data.totals.income - data.totals.expense;
			// Calculate the percentage of income that we spent
			if(data.totals.income > 0){
				data.percentage = Math.round((data.totals.expense / data.totals.income) * 100) ;
			} else {
				data.percentage = -1;
			}
		},

		calculatePercentages: function(type, id){
			data.allItems.expense.forEach(function(element){
				element.calculatePercentage(data.totals.income);
			});
		},

		getPercentages: function(){
			var allPercentages = data.allItems.expense.map(function(element){
				return element.getPercentage();
			});
			return allPercentages;
		},

		getBudget: function(){
			return  {
				budget: data.budget,
				totalIncome: data.totals.income,
				totalExpense: data.totals.expense,
				percentage: data.percentage

			};
		},

		testing: function(){
			console.log(data);
		}
	}
})();


// UI CONTROLLER

var UIController = (function(){

	var DOMstrings = {
		inputType: '.add__type',
		inputDescription: '.add__description',
		inputValue: '.add__value',
		inputBtn: '.add__btn',
		incomeContainer:'.income__list',
		expenseContainer:'.expense__list',
		budgetLabel: '.budget__value',
		incomeLabel: '.budget__income--value',
		expenseLabel: '.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage',
		container: '.container',
		expensesPercentageLabel: '.item__percentage',
		dateLabel: '.budget__title--month'
	};

	var formatNumber = function(num, type){
		var numSplit, int, dec, sign;
		/*
		 + or - before number
		 exactly 2 decimal points
		 comma separating the thousands

		 2310.467 -> + 2,310.46
		 2000 -> - 2,000.00
		*/

		num = Math.abs(num);
		num = num.toFixed(2);

		numSplit = num.split('.');

		int = numSplit[0];
		if(int.length>3){
			int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
		}
		dec = numSplit[1];

		// type === 'expense' ? sign = '-' : sign = '+';

		return (type === 'expense' ? '-' : '+') + ' ' + int +  '.' + dec;
	};

	var nodeListForEach = function(list, callback){
		for(var i = 0 ; i<list.length; i++){
			callback(list[i], i);
		}
	};
	
	return {
		getinput: function(){
			return {
			type: document.querySelector(DOMstrings.inputType).value, // Will be either inc or exp
			description: document.querySelector(DOMstrings.inputDescription).value,
			value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
			}
		},

		addListItem: function(obj, type){
			// Create HTML string with placeholder text
			var html , newHtml, element;
			if(type === 'income'){
				element = DOMstrings.incomeContainer;
				html = '<div class="item clearfix" id="income-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			} else if(type === 'expense'){
				element = DOMstrings.expenseContainer;
				html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}
				 

			// Replace the placeholder text with some actual data
			newHtml = html.replace('%id%', obj.id);
			newHtml = newHtml.replace('%value%', formatNumber(obj.value, type) );
			newHtml = newHtml.replace('%description%', obj.description);
			// Insert the HTML into the DOM
			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

		},

		deleteListItem: function(selectorID){

			var element = document.getElementById(selectorID);
			element.parentNode.removeChild(element);
		},

		clearFields: function(){
			var fields, fieldsArray;

			fields =document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

			fieldsArray =Array.prototype.slice.call(fields);

			fieldsArray.forEach(function(current, index, array){
				current.value = "";
			});

			fieldsArray[0].focus();
		},

		displayBudget: function (obj){

			obj.budget > 0 ? type = 'income' : type = 'expense';

			document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type ) ;
			document.querySelector(DOMstrings.incomeLabel).textContent =  formatNumber(obj.totalIncome, 'income');
			document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExpense, 'expense');
			

			if(obj.percentage > 0 ){
				document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%' ;
			} else {
				document.querySelector(DOMstrings.percentageLabel).textContent = '---';
			}
		},

		displayPercentages: function(percentages){
			
			var fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel);

			

			nodeListForEach(fields, function(element, index){
				if(percentages[index] > 0 ){
					element.textContent = percentages[index] + '%';
				} else {
					element.textContent = '---';
				}
				

			});
		},

		displayDate: function(){
			var now, year, month, monthsArr;

			now = new Date();

			year = now.getFullYear();
			month = now.getMonth();

			monthsArr = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

			month = monthsArr[month];

			document.querySelector(DOMstrings.dateLabel).textContent = month + ' ' + year;
		},


		changeType: function(){
			var fields = document.querySelectorAll(
				DOMstrings.inputType + ',' +
				DOMstrings.inputDescription + ',' +
				DOMstrings.inputValue
				);

			nodeListForEach(fields, function(element){
				element.classList.toggle('red-focus');
			});

			document.querySelector(DOMstrings.inputBtn).classList.toggle('red');


		},
		
		getDOMstrings: function(){
			return DOMstrings;
		}
	};
})();

// GLOBAL APP CONTROLLER

var controller = (function(budgetCtrl, UICtrl){

	var setUpEventListeners = function(){
		var DOM = UIController.getDOMstrings();
		document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

		document.addEventListener('keypress', function(event){
			if(event.keyCode === 13 || event.which === 13){
				ctrlAddItem();
			}
		});

		document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem );

		document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
	};

	var updatePercentages = function(){
		//1. Calculate percentages
		budgetCtrl.calculatePercentages();

		//2. Read percentages from the budget controller
		var percentages = budgetCtrl.getPercentages();

		//3. Update the UI with the new percentages
		UICtrl.displayPercentages(percentages);
	};

	var updateBudget = function (){
		//1. Calculate the budget
		budgetCtrl.calculateBudget();

		//2. Return the budget
		var budget = budgetCtrl.getBudget();
		
		//3. Display Budget
		UICtrl.displayBudget(budget);
	};

	var ctrlAddItem = function(){
		var input, newItem;

		//1. Get the filled input data
		input = UICtrl.getinput();

		if(input.description !== "" && !isNaN(input.value) && input.value > 0){

			//2. Add the item to the budget controller
			newItem = budgetCtrl.addItem(input.type, input.description, input.value);

			//3. Add the item to the UI
			UICtrl.addListItem(newItem, input.type);

			//4. Clear the fields
			UICtrl.clearFields();

			//5. Calculate and update budget
			updateBudget();

			//6. Calculate and update percentaages
			updatePercentages();
		}
	};

	var ctrlDeleteItem = function(event){
		var itemID, splitID, type , ID;
		itemID = (event.target.parentNode.parentNode.parentNode.parentNode.id);

		if(itemID){
			//inc-1

			splitID = itemID.split('-')
			type = splitID[0];
			ID = splitID[1];

			//1. Delete item from data structure
			budgetCtrl.deleteItem(type,parseInt(ID));

			//2. Delete the item from the UI
			UICtrl.deleteListItem(itemID);

			//3. Update and show the new budget
			updateBudget();

			//4. Calculate and update percentaages
			updatePercentages();

		}
	};
		
	return {
		init: function(){
			console.log('The application has started!');
			UICtrl.displayDate();
			UICtrl.displayBudget({
				budget: 0,
				totalIncome: 0,
				totalExpense: 0,
				percentage: 0

			});
			setUpEventListeners();
		}
	};

}) (budgetController, UIController);

controller.init();