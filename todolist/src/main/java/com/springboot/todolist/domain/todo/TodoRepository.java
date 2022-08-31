package com.springboot.todolist.domain.todo;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

import com.springboot.todolist.web.dto.todo.UpdateTodoReqDto;

@Mapper
public interface TodoRepository {
	public int save(Todo todo) throws Exception;
	
	public List<Todo> getTodoList(Map<String, Object> map) throws Exception;
	
	public int updateTodoComplete(int todo_code) throws Exception;
	public int updateTodoImportance(int todo_code) throws Exception;
	public int updateTodoByTodoCode(Todo todo) throws Exception;
	
	public int remove(int todo_code) throws Exception;
	
}
