"use client";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "@nextui-org/react";
import { useEffect } from "react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Editor } from "@/framework/novel";
import sosoAPI from "../framework/api/sosoAPI";
import { HttpStatusCode } from "axios";

export default function ShowData(props) {
  const dispatch = useDispatch();

  const data = useSelector((state) => state.data);
  const isOpen = useSelector((state) => state.showData);
  const teamMembers = useSelector((state) => state.teamMembers);

  const [saveStatus, setSaveStatus] = useState("Saved");
  const [title, setTitle] = useState(data.title);
  const [content, setContent] = useState(data.content);

  const findDatasByLoginMember = props.findDatasByLoginMember;

  useEffect(() => {
    setTitle(data.title);
    setContent(data.content);
    localStorage.setItem("minsu", data.content);
  }, [data]);

  const onClose = () => {
    dispatch({ type: "toggleShowData" });
    dispatch({
      type: "setData",
      data: {
        id: "",
        dataIndex: "",
        state: "",
        fromMemberId: "",
        toMemberId: "",
        teamId: "",
        title: "",
        content: "",
        delYn: false,
        regDate: "",
        updDate: "",
      },
    });
  };

  const clickSaveBtn = () => {
    const updateData = {
      id: data.id,
      dataIndex: data.Index,
      state: data.state,
      fromMemberId: data.fromMemberId,
      toMemberId: data.toMemberId,
      teamId: data.teamId,
      title: title,
      content: content,
      delYn: data.delYn,
      regDate: data.regDate,
      updDate: data.updDate,
    };

    console.log("data");
    console.log(updateData);
    sosoAPI.patch("/data/data", updateData).then((res) => {
      if (res.status === HttpStatusCode.Ok) {
        console.log(res);
      } else if (res.response.status === HttpStatusCode.BadRequest) {
        dispatch({ type: "toggleCommonError", data: res.response.data });
      }
    });

    // const updatedDatas = updateDatasById(data, datas);
    findDatasByLoginMember();
    onClose();
  };

  const contentSave = () => {
    setContent(localStorage.getItem("minsu"));
    setSaveStatus("Saved");
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onClose}
      placement="top-center"
      size="5xl"
      isDismissable={false}
      isKeyboardDismissDisabled={true}
      hideCloseButton={true}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          요청 보기
          <div className="absolute right-10 top-5 z-10 mb-5 rounded-lg bg-stone-100 px-2 py-1 text-sm text-stone-400">
            {saveStatus}
          </div>
        </ModalHeader>
        <ModalBody>
          <Input
            tabIndex={-1}
            autoFocus
            label="타이틀"
            placeholder="제목을 입력하세요."
            variant="bordered"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            autoFocus
            label="보낸 사람"
            placeholder="받는 사람을 입력하세요."
            variant="bordered"
            value={
              data.fromMemberId
                ? teamMembers.find(
                    (member) => member.memberId === data.fromMemberId
                  )?.memberName || "멤버를 찾을 수 없음"
                : "fromMemberId가 없음"
            }
            isDisabled
          />

          <div>
            <Editor
              storageKey="minsu"
              onUpdate={() => {
                setSaveStatus("Unsaved");
              }}
              onDebouncedUpdate={() => {
                setSaveStatus("Saving...");
                // Simulate a delay in saving.
                setTimeout(() => {
                  contentSave();
                }, 500);
              }}
              defaultValue={() => {
                return JSON.parse(data.content);
              }}
              className="overflow-auto w-full min-h-[300px] max-h-[500px] sm:rounded-lg sm:border sm:shadow-lg editor-content"
              // completionApi="http://localhost:8081/api/kace"
            />
          </div>
          {/* <div className="flex py-2 px-1 justify-between">qwe</div> */}
        </ModalBody>
        <ModalFooter>
          <Button
            tabIndex={-1}
            color="danger"
            variant="flat"
            onPress={onClose}
            // className="bg-stone-200"
          >
            닫기
          </Button>
          <Button
            tabIndex={-1}
            color="primary"
            variant="flat"
            onPress={clickSaveBtn}
            isDisabled={saveStatus !== "Saved"}
            className="bg-stone-200"
          >
            저장
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

const updateDatasById = (newData, datas) => {
  const updatedDatas = { ...datas };
  for (const key in updatedDatas) {
    const keyArray = updatedDatas[key];
    updatedDatas[key] = keyArray.map((data) => {
      if (data.id === newData.id) {
        return { ...data, ...newData };
      }
      return data;
    });
  }
  return updatedDatas;
};
