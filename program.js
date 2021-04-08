Server side program 1
public void run()
	{
		String received;//for storing information received from client
		String toreturn="";//for storing information to be sent to client
		while (true)
		{
			try {

				// Ask user what he wants
				dos.writeUTF("Read filename for reading | Write filename for writing | StopRead file name to stop reading\n"+
							"Type Exit to terminate connection.");
				

				received = dis.readUTF();// receive the answer from client
				String [] words = received. split(" ");//get the words from the string
				
				if(words[0].equals("Exit"))//Close connection of the client
				{
					System.out.println("Client " + this.s + " sends exit...");
					System.out.println("Closing this connection.");
					this.s.close();
					System.out.println("Connection closed");
					break;
				}
				
				// write on output stream based on the
				// answer from the client
				switch (words[0]) {
					case "Read" ://Client wants to read
						if(words.length==2)//if len!=2 Client has not sent proper comand
						{
							if (Server2.map.containsKey(words[1]))//check if filename is available
							{
								if(Server2.mapwrite.get(words[1])==0)//check if noone is writing
								{
									if(Server2.mapread.get(words[1])==0)//check if no one is reading
									{
										toreturn="The content of the file is: "+Server2.map.get(words[1]);//give access to read
										Server2.mapread.replace(words[1], Server2.mapread.get(words[1])+1);//increase read count
										read.add(words[1]);//add filename of which access were given
										
									}
									else//if no one writing but someone reading
									{
										toreturn="Read only mode : The content of the file is: "+Server2.map.get(words[1]);//give access in read only mode
										Server2.mapread.replace(words[1], Server2.mapread.get(words[1])+1);//increase read count
										read.add(words[1]);//add filename of which access were given
										
									}
								}
								else//someone is writing so no access is given
								{
									toreturn="No access to the file";
								}
								dos.writeUTF(toreturn);
							}
						}
						else//filename is not entered abort transmission
						{
							toreturn="Enter filename";
							dos.writeUTF(toreturn);
						}
						break;
					case "Write" ://Client wants to write
						if(words.length==2)//check command is proper
						{
							if (Server2.map.containsKey(words[1]))//filename is available
							{
								if((Server2.mapwrite.get(words[1])==0)&&(Server2.mapread.get(words[1])==0))//noone is reading or writing
								{
									toreturn="You can start writing write the changed version";//give access to write
									Server2.mapwrite.replace(words[1], Server2.mapwrite.get(words[1])+1);//increase writecount
									dos.writeUTF(toreturn);//return comment
									received = dis.readUTF();//store the received
									String [] words1 = received.split(" ");
									while(!words1[0].equals("StopWrite"))//check if Client wants to stop writing
									{
										if(words1[0].equals("replace"))//replace content of file
										{
											String newstr="";
											for(int i=1;i<words1.length;i++)
											{
												newstr+=" ";
												newstr+=words1[i];
											}
											Server2.map.replace(words[1], newstr);
											toreturn="Replaced";
											dos.writeUTF(toreturn);
										}
										else if(words1[0].equals("append"))//append content of file
										{
											String newstr=Server2.map.get(words[1]);
											for(int i=1;i<words1.length;i++)
											{
												newstr+=" ";
												newstr+=words1[i];
											}
											Server2.map.replace(words[1], newstr);
											toreturn="Appended";
											dos.writeUTF(toreturn);
										}
										else//proper operation is not entered
										{
											toreturn="Enter proper operation";
											dos.writeUTF(toreturn);
										}
										received = dis.readUTF();
										words1 = received.split(" ");
									}
									Server2.mapwrite.replace(words[1], Server2.mapwrite.get(words[1])-1);
									toreturn="Write access taken back";
									dos.writeUTF(toreturn);
								}
								else//someone is reading or writing
								{
									toreturn="No access to the file";
									dos.writeUTF(toreturn);
								}
							}
							else//filename is not available
							{
								toreturn="No such file exists";
								dos.writeUTF(toreturn);
							}
						}
						else//no proper command
						{
							toreturn="Enter filename";
							dos.writeUTF(toreturn);
						}
						break;
					
					case "StopRead" ://user wants to stop reading
						if(words.length==2)//check command is proper
						{
							if (Server2.map.containsKey(words[1]))
							{
								if(read.contains(words[1]))//check if actually access was given previously
								{
									Server2.mapread.replace(words[1], Server2.mapread.get(words[1])-1);
									toreturn="Reading access taken back";
									read.remove(words[1]);//remove access
								}
								else//no access
								{
									toreturn="You did not have reading access to the file";
								}
							}
							else//wrong filename
							{
								toreturn="No such file exists";
							}
							dos.writeUTF(toreturn);
						}
						else//not proper command
						{
							toreturn="Enter filename";
							dos.writeUTF(toreturn);
						}
						break;
					default://invalid input
						dos.writeUTF("Invalid input");
						break;
				}
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
		
		try
		{
			// closing resources
			this.dis.close();
			this.dos.close();
			
		}catch(IOException e){
			e.printStackTrace();
		}
	}
}
#########################################
client side program 1

Scanner scn = new Scanner(System.in);
			
			// getting localhost ip
			InetAddress ip = InetAddress.getByName("localhost");
	
			// establish the connection with server port 5056
			Socket s = new Socket(ip, 5056);
	
			// obtaining input and out streams
			DataInputStream dis = new DataInputStream(s.getInputStream());
			DataOutputStream dos = new DataOutputStream(s.getOutputStream());
	
			// the following loop performs the exchange of
			// information between client and client handler
			while (true)//run infinite loop
			{
				System.out.println(dis.readUTF());//print string received from server
				String tosend = scn.nextLine();//take input to send
				dos.writeUTF(tosend);//send input
				String [] words = tosend.split(" ");//get words from input string
				if(words[0].equals("Exit"))// If client sends exit,close this connection and then break from the while loop
				{
					System.out.println("Closing this connection : " + s);
					s.close();
					System.out.println("Connection closed");
					break;
				}
				else if(words[0].equals("Write"))//if user wants to write
				{
					String received = dis.readUTF();
					System.out.println(received);
					if(!received.equals("No access to the file"))
					{
						while(!words[0].equals("StopWrite"))//give user to write until stop write
						{
							System.out.println("Enter append to append and replace to replace before content. Enter StopWrite to stop writing");
							tosend = scn.nextLine();//send proper command to append replace or stop writing
							dos.writeUTF(tosend);
							words = tosend.split(" ");
							received = dis.readUTF();
							System.out.println(received);
						}
					}
				}
				else//handle all other cases like read or stopread as only one receiving is enough here
				{
					String received = dis.readUTF();
					System.out.println(received);
				}
			}
			
			// closing resources
			scn.close();
			dis.close();
			dos.close();
		}catch(Exception e){
			e.printStackTrace();
		}
	}
	
	
########################################	
Server side program2
public void run()
	{
		String received;//store string received from Client
		HashMap<String, Integer> allocated = new HashMap<>();//used to check how many resource were allocated to whom
		String toreturn="";
		int num=Server3.count;
		Server3.count++;
		while (true)
		{
			try {

				// Ask user what he wants
				String send = "Total resources are "+ Server3.total_res+ " \nEnter resource and number from available resources and append alloc before to allocate and dealloc to deallocate" + Server3.aval_res;
				dos.writeUTF(send);
				
				// receive the answer from client
				received = dis.readUTF();
				//break the string into words
				String [] words = received. split(" ");
				if(words[0].equals("Exit"))//if client wants to exit close connection
				{
					System.out.println("Client " + this.s + " sends exit...");
					System.out.println("Closing this connection.");
					this.s.close();
					System.out.println("Connection closed");
					break;
				}
				if(words.length==3)
				{
					if(words[0].equals("alloc"))//if user wants to allocate resource
					{
						if(Server3.total_res.containsKey(words[1]))//check if resource name is correct
						{
							if(Server3.aval_res.get(words[1])>=Integer.parseInt(words[2]))//check if requested number of resource actually available
							{
								Server3.aval_res.replace(words[1], Server3.aval_res.get(words[1])-Integer.parseInt(words[2]));//allocate resouce
								toreturn="Resource allocated";
								if(allocated.containsKey(words[1]))//if previously allocated, increase count
								{
									allocated.replace(words[1],allocated.get(words[1])+Integer.parseInt(words[2]));
								}
								else//else store the number of resiurces allocated
								{
									allocated.put(words[1],Integer.parseInt(words[2]));
								}
								dos.writeUTF(toreturn);
							}
							else//requested number of resources not available
							{
								toreturn="Resources are not free enter wait to wait for all resources, get for getting the rest abort for aborting";//user can wait,get whatever available or abort
								dos.writeUTF(toreturn);
								received = dis.readUTF();
								switch (received)
								{
									case "wait" :
										toreturn="Wait for the resources";
										dos.writeUTF(toreturn);
										Server3.queue.put(num,words[1]);
										boolean flag=true;
										while(flag)// wait and check if requested number of resiyrces made available
										{
											if(Server3.aval_res.get(words[1])>=Integer.parseInt(words[2]))//requested number of resiurce allocated
											{
												for (Map.Entry mapElement : Server3.queue.entrySet()) //check if it is the turn for it in queue
												{
													int key = (int)mapElement.getKey();
													String value = (String)mapElement.getValue();
													if((key==num)&&(value.equals(words[1])))//resources available and it it it's turn
													{
														Server3.aval_res.replace(words[1], Server3.aval_res.get(words[1])-Integer.parseInt(words[2]));
														Server3.queue.remove(num);//remove request from queue
														toreturn="Resource allocated";
														dos.writeUTF(toreturn);
														if(allocated.containsKey(words[1]))//if previously allocated, increase count
														{
															allocated.replace(words[1],allocated.get(words[1])+Integer.parseInt(words[2]));
														}
														else//else store the number of resiurces allocated
														{
															allocated.put(words[1],Integer.parseInt(words[2]));
														}
														flag=false;
														break;
													}
													else if((key!=num)&&(value.equals(words[1])))//come out of for loop if it is not its turn
													{
														break;
													}
												}
											}
										}
										break;
									case "get" ://allocate whichever resource available in this moment
										if(allocated.containsKey(words[1]))//if previously allocated, increase count
										{
											allocated.replace(words[1],allocated.get(words[1])+Server3.aval_res.get(words[1]));
										}
										else//else store the number of resiurces allocated
										{
											allocated.put(words[1],Server3.aval_res.get(words[1]));
										}
										dos.writeUTF(toreturn);
										Server3.aval_res.replace(words[1], 0);
										toreturn="Resource allocated";
										dos.writeUTF(toreturn);
										break;
									case "abort" ://abort
										toreturn="Aborted";
										dos.writeUTF(toreturn);
										break;
								}
							}
						}
						else
						{
							toreturn="No such resource exists";
							dos.writeUTF(toreturn);
						}
					}
					else if(words[0].equals("dealloc"))//deallocate resource
					{
						if(allocated.containsKey(words[1]))//check if it was actually allocated
						{
							if(allocated.get(words[1])>=Integer.parseInt(words[2]))//check if returned resources are less than or equals to actually allocated
							{
								Server3.aval_res.replace(words[1], Server3.aval_res.get(words[1])+Integer.parseInt(words[2]));
								toreturn="Resource deallocated";
								dos.writeUTF(toreturn);
							}
							else
							{
								toreturn="Trying to return more resources than allocated. transaction aboreted";
								dos.writeUTF(toreturn);
							}
						}
						else//trying to return unallocated resource
						{
							toreturn="No such resource was allocated. Transaction aborted";
							dos.writeUTF(toreturn);
						}
					}
					else//improper command
					{
						toreturn="Enter proper command";
						dos.writeUTF(toreturn);
					}
				}
				else
				{
					toreturn="Enter proper command";
					dos.writeUTF(toreturn);
				}
				
				
				
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
		
		try
		{
			// closing resources
			this.dis.close();
			this.dos.close();
			
		}catch(IOException e){
			e.printStackTrace();
		}
	}
}
########################################
client side program2
Scanner scn = new Scanner(System.in);
			
			// getting localhost ip
			InetAddress ip = InetAddress.getByName("localhost");
	
			// establish the connection with server port 5056
			Socket s = new Socket(ip, 5056);
	
			// obtaining input and out streams
			DataInputStream dis = new DataInputStream(s.getInputStream());
			DataOutputStream dos = new DataOutputStream(s.getOutputStream());
	
			// the following loop performs the exchange of
			// information between client and client handler
			while (true)
			{
				System.out.println(dis.readUTF());
				String tosend = scn.nextLine();
				dos.writeUTF(tosend);
				String [] words = tosend.split(" ");
				// If client sends exit,close this connection
				// and then break from the while loop
				if(words[0].equals("Exit"))//close connection
				{
					System.out.println("Closing this connection : " + s);
					s.close();
					System.out.println("Connection closed");
					break;
				}
				else if(words[0].equals("dealloc"))//wants to deallocate
				{
					String received = dis.readUTF();
					System.out.println(received);
				}
				else//wants to allocate
				{
					String received = dis.readUTF();
					System.out.println(received);
					if(received.equals("Resources are not free enter wait to wait for all resources, get for getting the rest abort for aborting"))//if not allocated wait, get or abort
					{
						tosend = scn.nextLine();
						dos.writeUTF(tosend);
						received = dis.readUTF();
						System.out.println(received);
						if(!tosend.equals("abort"))
						{
							received = dis.readUTF();
							System.out.println(received);
						}
					}
				}
			}
			
			// closing resources
			scn.close();
			dis.close();
			dos.close();
		}catch(Exception e){
			e.printStackTrace();
		}
	}
}
