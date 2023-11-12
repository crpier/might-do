import { DragDropContext, Draggable } from "react-beautiful-dnd";
import { StrictModeDroppable } from "~/utils/helpers";
import { api } from "~/utils/api";
import { useEffect, useState } from "react";
import { todoData } from "~/utils/types";

import type { DropResult } from "react-beautiful-dnd";

export default function TodoList() {
  const getTodos = api.post.getTodos.useQuery();
  const updateTodosOrder = api.post.updateTodosOrder.useMutation({});
  const [todos, updateTodos] = useState(getTodos.data ?? []);

  useEffect(() => {
    const arrayIdsOrder = JSON.parse(
      localStorage.getItem("taskOrder") ?? "null",
    ) as number[] | null;

    if (!arrayIdsOrder && getTodos?.data?.length) {
      const idsOrderArray = getTodos.data.map((task) => task.id);
      localStorage.setItem("taskOrder", JSON.stringify(idsOrderArray));
    }

    let myArray: Array<todoData | undefined> = [];
    if (arrayIdsOrder?.length && getTodos?.data?.length) {
      myArray = arrayIdsOrder.map((pos: number) => {
        return getTodos.data.find((el) => el.id === pos);
      });

      const newItems = getTodos.data.filter((el) => {
        return !arrayIdsOrder.includes(el.id);
      });

      if (newItems?.length) myArray = [...newItems, ...myArray];
    }

    if (getTodos.data) {
      updateTodos((myArray ?? getTodos.data) as todoData[]);
    }
  }, [getTodos.data]);

  const handleOnDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const tasks = [...todos];
    const [reorderedItem] = tasks.splice(result.source.index, 1);
    tasks.splice(result.destination.index, 0, reorderedItem!);

    const reorderedTodos = tasks.map((task, index) => {
      task.position = index;
      return task
    });
    updateTodosOrder.mutate([...reorderedTodos]);

    updateTodos(tasks);
  };

  const handleDelete = (id: number) => {
    const arrayIdsOrder = JSON.parse(
      localStorage.getItem("taskOrder") ?? "null",
    ) as number[] | null;

    if (arrayIdsOrder?.length) {
      const newIdsOrderArray = arrayIdsOrder.filter(
        (num: number) => num !== id,
      );

      localStorage.setItem("taskOrder", JSON.stringify(newIdsOrderArray));
      // TODO: delete mutation on TRPC
    }
  };

  if (todos) {
    return (
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <StrictModeDroppable droppableId="todos">
          {(provided, snapshot) => (
            <ul {...provided.droppableProps} ref={provided.innerRef}>
              {todos
                .sort((todoA, todoB) => todoA.position - todoB.position)
                .map((todo, index) => {
                  return (
                    <Draggable
                      key={todo.id}
                      draggableId={todo.id.toString()}
                      index={index}
                    >
                      {(provided) => (
                        <li
                          className=""
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          {todo.text}
                        </li>
                      )}
                    </Draggable>
                  );
                })}
              {provided.placeholder}
            </ul>
          )}
        </StrictModeDroppable>
      </DragDropContext>
    );
  } else {
    return <div>waiting on data...</div>;
  }
}
