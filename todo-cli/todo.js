const todoList = () => {
    all = []
    const add = (todoItem) => {
      all.push(todoItem)
    }
    const markAsComplete = (index) => {
      all[index].completed = true
    }
  
    const overdue = () => {
      // Write the date check condition here and return the array
      // of overdue items accordingly.
      return all.filter(todo=>todo.dueDate<today);
    }
  
    const dueToday = () => {
      // Write the date check condition here and return the array
      // of todo items that are due today accordingly.
      return all.filter(todo=>todo.dueDate===today);
    }
  
    const dueLater = () => {
      // Write the date check condition here and return the array
      // of todo items that are due later accordingly.
      return all.filter(todo=>todo.dueDate>today);
    }
  
    const toDisplayableList = (list) => {
      // Format the To-Do list here, and return the output string
      // as per the format given above.
      return list.map(todo=>{
        const checkbox=todo.completed? "[x]":"[ ]";
        const displayDate=todo.dueDate===today?"":`${todo.dueDate}`;
        return `${checkbox} ${todo.title} ${displayDate}`;
      }).join("\n");
    }
  
    return {
      all,
      add,
      markAsComplete,
      overdue,
      dueToday,
      dueLater,
      toDisplayableList
    };
  };

module.exports=todoList;