
<script>
  import { ref, nextTick } from "vue";
  import { useCatlogAddingStore } from "@store/CatlogAddingStore"

  export default {
    setup() {
      const messages = ref([
        { role: "assistant", text: "Hi, I'm Miaa! Your AI Assistant helping you generate medical image description. Now I could help you generate a new set of key-points that meet your requirement of a specific medical image catalog, please let me know the catalog of the medical image." },
      ]);
      const userInput = ref("");

      const CatlogAddingStore = useCatlogAddingStore()
      
      
      // Send user message and get system response
      const sendMessage = async () => {
        if (!userInput.value.trim()) return;
  
        // Add user message
        messages.value.push({ role: "user", text: userInput.value });
  
        // Clear input
        const userText = userInput.value;
        userInput.value = "";
  
        // Scroll down after updating messages
        await nextTick();
        scrollToBottom();
  
        messages.value.push({ role: "assistant", text: "Waiting..." });
        nextTick().then(scrollToBottom);
        const res = await window.api.invoke('renderer-to-main-async', {
            name: "addcat-chat",
            event: "asyncevent",
            data: {
                'apiURL': window.localStorage.getItem("apiURL2"),
                'apiKEY': window.localStorage.getItem("apiKEY2"),
                'request':{
                    model: window.localStorage.getItem("MODEL2"),
                    messages: messages.value.reduce((acc, item) => {
                        acc.push( {
                            "role" : item.role,
                            "content" : item.text
                        });
                        return acc;
                    }, [])
                }
            }
        });
        messages.value.pop();
        nextTick().then(scrollToBottom);
        
        try{
          const regex = /<json>([\s\S]*?)<\/json>/;
          const match = res.match(regex);
          const res_json = JSON.parse(match[1]);
          CatlogAddingStore.setList(res_json["key_points"])
          if ("massage" in res_json){
            messages.value.push({ role: "assistant", text: res_json["massage"] });
          } else {
            messages.value.push({ role: "assistant", text: "I have done the work, let me show you the key points below." });
          }
        } catch {
          messages.value.push({ role: "assistant", text: res });
        }
        nextTick().then(scrollToBottom);
      };
  
      // Auto-scroll to the latest message
      const scrollToBottom = () => {
        const chatContainer = document.querySelector(".chat-container");
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      };
  
      return { messages, userInput, sendMessage, scrollToBottom};
    },
  };
</script>
  

<template>
     <el-col :span="22" justify="center" class="style-color-3 chat-panel">
        <el-row :span="24" justify="center">
            <el-col :span="22">
                <div class="chat-container">
                    <div v-for="(message, index) in messages" :key="index" :class="['message', message.role]">
                        {{ message.text }}
                    </div>
                </div>
            </el-col>
        </el-row>

        <el-row :span="24" justify="center">
            <el-col :span="20">
                <el-input
                    v-model="userInput"
                    placeholder="Type a message..."
                    @keyup.enter="sendMessage"
                    size="large"
                >
                    <template #append>
                        <el-button @click="sendMessage" round>Send</el-button>
                    </template>
                </el-input>
            </el-col>
        </el-row>

        <el-row :span="24" style="height: 10px;"></el-row>
    
     </el-col>
    
</template>
  
<style>
    .chat-panel {
        padding: 10px;
        margin: 10px;
        border-radius: 8px;
    }

  .chat-container {
    display: flex;
    flex-direction: column;
    align-items: flex-start; /* Align system messages to the left */
    height: 150px;
    overflow-y: auto;
    padding: 15px;
    border: 2px solid #ffffff;
    border-radius: 5px;
    margin: 12px;
    background-color: #e7efe6a4;
  }
  
  .message {
    display: inline-block; /* Allow width to fit content */
    padding: 8px;
    margin: 5px 0;
    border-radius: 10px;
    word-break: break-word;
  }
  
  .user {
    background: #007bff;
    color: rgb(216, 212, 212);
    align-self: flex-end;
    text-align: right;
  }
  
  .assistant {
    background: #f1f1f1;
    color: black;
    align-self: flex-start;
    text-align: left;
  }
  </style>
  