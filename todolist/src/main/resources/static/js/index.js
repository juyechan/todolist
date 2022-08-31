const selectedTypeButton = document.querySelector(".selected-type-button");
const typeSelectBoxList = document.querySelector(".type-select-box-list");
const typeSelectBoxListLis = typeSelectBoxList.querySelectorAll("li");
const todoContentList = document.querySelector(".todo-content-list");
const sectionBody = document.querySelector(".section-body");
const incompleteCountNumber = document.querySelector(".incomplete-count-number");
const modalContainer = document.querySelector(".modal-container");
const todoAddButton = document.querySelector(".todo-add-button");

/*

	게시글 불러오기 
	
	1. todolist의 type이 무엇인지 중요함.
	2. type의 종류 -all
				 -importance
				 -complete
				 -incomplete
	3.요청주소 : /api/v1/todolist/list/{type}?page=페이지 번호 & contentCount = 글의 개수
	
	4.AJAX 요청을 활용 
		-type : get
		-url: 요청주소
		-data: 객체 -> {key : value} -> {page:1, contentCount:20}
		-dataType: 응답받을 데이터의 타입 -> json
		-success: 함수 -> response 매개변수를 받아야함.
		-error: 함수 -> 요청실패 400,500
			-400 에러의경우
				-매개변수 타입이 잘 못된경우
				-요청 리소스가 잘 못된 경우 
				-권한이 없어서 요청을 하지 못하는 경우
				-contentType
					-text/html
					-text/plain
					-application/json
				-enctype : multipart/form-data
			-500 에러의 경우
				-가장 먼저 해야하는것 -> console창 에러의 가장 위쪽이면서 가장 오른쪽 확인!
				-오타
				-nullpointer
				-sql
				-indexOut
				-di 잘못됬으때
				-@component(Controller,RestController,Service,Mapper,Respository,Configuratioin)
				IoC등록 안됬을때
				-Interface 겹칠떄, Bean 객체가 IoC에 여러개 생성되어 있을때
				
*/

let totalPage = 0;
let page = 1 ;
let listType = "all";

load();



function setIncompleteCount(incompleteCount) {
	incompleteCountNumber.textContent = incompleteCount;
}

function setTotalPage(totalCount) {
	totalPage = totalCount % 20 == 0 ? totalCount / 20 : Math.floor(totalCount / 20) + 1
}

function appendList(listContent) {
	todoContentList.innerHTML += listContent;
}

function updateCheckStatus(type,todoContent,todoCode) {
	let result = updateStatus(type,todoCode);
	
	if(
		(
			(
				type == "complete" 
				&& 
				(listType == "complete" || listType == "incomplete")
				)
	  			|| 
	  			(type == "importance" && listType =="importance")
	  			)
	  			&&
	  			result
	  			){
		todoContentList.removeChild(todoContent);
	}
}


function addCompleteEvent(todoContent,todoCode){
	
	const completeCheck = todoContent.querySelector(".complete-check");
	
	todoContent.querySelector(".complete-check").onchange = () =>{
		
			let incompleteCount = parseInt(incompleteCountNumber.textContent)
			
			if(completeCheck.checked){
				
				incompleteCountNumber.textContent = incompleteCount - 1;
			}else{
				incompleteCountNumber.textContent = incompleteCount + 1;
			}
			updateCheckStatus("complete",todoContent,todoCode);
			//동기가 되어있으면 바로처리
			//비동기일경우 나중에처리해서 보류가됨 
		}
}
function addImportanceEvent(todoContent,todoCode){
	const importanceCheck = todoContent.querySelector(".importance-check");
	importanceCheck.onchange = () =>{
			updateCheckStatus("importance",todoContent,todoCode);
		}
}
function addDeleteEvent(todoContent,todoCode){
	const trashButton = todoContent.querySelector(".trash-button");
	
	trashButton.onclick = () =>{
			deleteTodo(todoContent,todoCode);
		}
}

function addContentInputEvent(todoContent,todoCode) {
	const todoContentText = todoContent.querySelector(".todo-content-text");
	const todoContentInput = todoContent.querySelector(".todo-content-input")
	let todoContentOldValue = null;
		
	let eventFlag = false;
		
		
		
		let updateTodo = () => {
			const todoContentNewValue = todoContentInput.value;
			
			if(getChangeStatusOfValue(todoContentOldValue,todoContentNewValue)){
				if(updateTodoContent(todoCode,todoContentNewValue)){
						todoContentText.textContent = todoContentNewValue;
					}
				}
				
				todoContentText.classList.toggle("visible");
				todoContentInput.classList.toggle("visible");
				
		}
		
		todoContentText.onclick = (e) => {
			todoContentValue = todoContentInput.value;
			e.target.classList.toggle("visible");
			todoContentInput.classList.toggle("visible");
			todoContentInput.focuse();
			eventFlag = true;
		}
		
		todoContentInput.onblur = () => { //blur 포커스가 벗어났을때
			if(eventFlag){
				 updateTodo();
			}
		}
		
		todoContentInput.onkeyup = () => {
			if(window.event.keyCode == 13){
				eventFlag = false;
				 updateTodo();
			}
		}
}
function getChangeStatusOfValue(originValue,newValue){
	return originValue != newValue;
}


function substringTodoCode(todoContent) {
	const completeCheck = todoContent.querySelector(".complete-check");
	
	const todoCode = completeCheck.getAttribute("id");
	const tokenindex = todoCode.lastIndexOf("-");
	return todoCode.substring(tokenindex + 1);
		/*console.log("todoCode:" + todoCode);*/
}

function addEvent() {
	const todoContents = document.querySelectorAll(".todo-content");
	
	for(let todoContent of todoContents){
		
		const todoCode = substringTodoCode(todoContent);
		
		addCompleteEvent(todoContent,todoCode)
		addImportanceEvent(todoContent,todoCode)
		addDeleteEvent(todoContent,todoCode)
		addContentInputEvent(todoContent,todoCode)
		
		
	}
}




function createList(todoList) {
	
	
	for(let content of todoList) {
		const listContent = `
			<li class="todo-content">
                <input type="checkbox" id="complete-check-${content.todoCode}" class="complete-check" ${content.todoComplete ? 'checked' : ''}>
                <label for="complete-check-${content.todoCode}"></label>
                <div class="todo-content-text">${content.todo}</div>
                <input type="text" class="todo-content-input visible" value="${content.todo}">
                <input type="checkbox" id="importance-check-${content.todoCode}" class="importance-check" ${content.importance ? 'checked' : ''}>
                <label for="importance-check-${content.todoCode}"></label>
                <div class="trash-button"><i class="fa-solid fa-trash"></i></div>
            </li>
		`
		appendList(listContent)
	}
	addEvent();
}


sectionBody.onscroll = () => {
	/*
	console.log("sectionBody:" + sectionBody.offsetHeight);
	console.log("scrollTop:" + sectionBody.scrollTop);
	console.log("todoContentList:" + todoContentList.clientHeight);
	*/
	
	let checkNum = todoContentList.clientHeight - sectionBody.offsetHeight - sectionBody.scrollTop;
	
	if(checkNum < 1 && checkNum > -1 && page < totalPage){
		console.log(page);
		console.log(totalPage);
		page++
		load();
	}
}

selectedTypeButton.onclick = () => {
    typeSelectBoxList.classList.toggle("visible");
}

function resetPage(){
	page = 1;
}

function removeAllclassList(elements ,className) {
	for(let element of elements){
			element.classList.remove(className);
		}
}

function setListType(selectedType){
	listType = selectedType.toLowerCase();
}

function clearTodoContentList(){
	todoContentList.innerHTML = "";
}

for(let i = 0; i < typeSelectBoxListLis.length; i++){
	
	typeSelectBoxListLis[i].onclick = () => {
		resetPage();
		
		removeAllclassList(typeSelectBoxListLis,"type-selected");
		
		typeSelectBoxListLis[i].classList.add("type-selected");
		
		setListType(typeSelectBoxListLis[i].textContent)
					
		const selectedType = document.querySelector(".selected-type");
		
		selectedType.textContent = typeSelectBoxListLis[i].textContent;
		
		clearTodoContentList();
		
		load();
		
		typeSelectBoxList.classList.toggle("visible");
		
	}
	
}
todoAddButton.onclick = () => {
	modalContainer.classList.toggle("modal-visible");
	todoContentList.style.overflow = "hidden";
	setModalEvent();
}

function clearModalTodoInputValue(modalTodoInput){
	modalTodoInput.value="";
}

function uncheckedImportance(importanceFlag) {
	importanceFlag.cheked = false;
}



function setModalEvent() {
	
	const modalCloseButton = modalContainer.querySelector(".modal-close-button");
	const importanceFlag = modalContainer.querySelector(".importance-check");
	const modalTodoInput = modalContainer.querySelector(".modal-todo-input");
	const modalCommitButton = modalContainer.querySelector(".modal-commit-button");
	
	modalContainer.onclick = (e) => {
		if(e.target == modalContainer){
			modalCloseButton.click();
		}
	}
	
	modalCloseButton.onclick = () =>{
		modalContainer.classList.toggle("modal-visible");
		todoContentList.style.overflow = "auto";
		uncheckedImportance(importanceFlag);
		clearModalTodoInputValue(modalTodoInput);
	}
	
	modalTodoInput.onkeyup = () => {
		if(window.event.keyCode == 13){
			modalCommitButton.click();
		}
	}
	
	modalCommitButton.onclick = () => {
		data = {
			importance:importanceFlag.checked,
			todo: modalTodoInput.value
		}
		addTodo(data);
		modalCloseButton.click();
	}
}


/////////////////////////////REQUEST///////////////////////////////
function load() {
	$.ajax({
		type: "get",
		url: `/api/v1/todolist/list/${listType}`,
		data: {
			"page": page,
			contentCount: 20
		},
		dataType: "json",
		success: (response) => {
			const todoList = response.data;
			
			setTotalPage(todoList[0].totalCount);
			setIncompleteCount(todoList[0].incompleteCount);
			/*console.log(JSON.stringify(response));*/
			createList(todoList);
		},
		error: errorMessage
		
	})
}

function updateTodoContent(todoCode,todo){
	let successFlag = false;
	
	$.ajax({
		type:"put",
		url:`/api/v1/todolist/todo/${todoCode}`,
		contentType: "application/json",
		data: JSON.stringify({
			"todoCode":todoCode,
			"todo":todo
			}),
		async:false,
		dataType: "json",
		success:(response) =>{
			successFlag = response.data;
		},
		error: errorMessage
	})
	return successFlag;
}

function updateStatus(type,todoCode){
	result = false;
	
	$.ajax({
		type:"put",
		url:`/api/v1/todolist/${type}/todo/${todoCode}`,
		async:false, //동기처리 true=>비동기 처리  동기vs 비동기의 차이????
		dataType:"json",
		success:(response) => {
			if(response.data == true){
				result = response.data
			}
		},
		error:errorMessage
	})
	return result;
}



function deleteTodo(todoContent,todoCode) {
	$.ajax({
		type: "delete",
		url: `/api/v1/todolist/todo/${todoCode}`,
		async: false,
		dataType: "json",
		success: (response) => {
			if(response.data){
				todoContentList.removeChild(todoContent);
			}
		},
		error: errorMessage
	})
}

function addTodo(data){
	$.ajax({
		type:"post",
		url:"/api/v1/todolist/todo",
		contentType:"application/json",
		data: JSON.stringify(data),
		async:false,
		dataType: "json",
		success:(response)=>{
			if(response.data){
				clearTodoContentList();
				load();
			}
		},
		error : errorMessage
	}) 
}


function errorMessage(request, status, error) {
	alert("요청 실패");
	console.log(request.status);
	console.log(request.responseText);
	console.log(error);
}
